const db = require('../../config/db');

class StudentDashboardController {
    // Get student's multi-subject progress dashboard
    static async getStudentDashboard(req, res) {
        try {
            const { studentRoll } = req.params;

            // Get student basic info
            const [studentInfo] = await db.execute(`
                SELECT s.*, sec.section_name, g.grade_name
                FROM students s
                JOIN sections sec ON s.section_id = sec.id
                JOIN grades g ON sec.grade_id = g.id
                WHERE s.roll = ?
            `, [studentRoll]);

            if (!studentInfo.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            // Get progress across all subjects
            const [subjectProgress] = await db.execute(`
                SELECT 
                    sub.id as subject_id, sub.subject_name,
                    sb.batch_name, sb.batch_level,
                    COUNT(DISTINCT th.id) as total_topics,
                    COUNT(DISTINCT CASE WHEN stp.status = 'Completed' THEN stp.topic_id END) as completed_topics,
                    COUNT(DISTINCT CASE WHEN stp.status = 'In Progress' THEN stp.topic_id END) as in_progress_topics,
                    AVG(CASE WHEN stp.completion_percentage IS NOT NULL THEN stp.completion_percentage ELSE 0 END) as avg_completion_percentage,
                    AVG(CASE WHEN stp.last_assessment_score IS NOT NULL THEN stp.last_assessment_score ELSE 0 END) as avg_assessment_score,
                    COALESCE(homework_completion_rate(?, sub.id), 0) as homework_completion_rate,
                    spt.is_on_penalty, spt.homework_miss_count, spt.failed_assessment_count
                FROM subjects sub
                JOIN topic_hierarchy th ON sub.id = th.subject_id
                LEFT JOIN student_topic_progress stp ON th.id = stp.topic_id AND stp.student_roll = ?
                LEFT JOIN student_batch_assignments sba ON sba.student_roll = ? AND sba.is_current = 1
                LEFT JOIN section_batches sb ON sba.batch_id = sb.id AND sb.subject_id = sub.id
                LEFT JOIN student_penalty_tracking spt ON spt.student_roll = ? AND spt.subject_id = sub.id
                WHERE th.subject_id IN (
                    SELECT DISTINCT subject_id FROM mentor_grade_subject_assignments mgsa
                    JOIN sections sec ON sec.grade_id = mgsa.grade_id
                    WHERE sec.id = ?
                )
                GROUP BY sub.id, sub.subject_name, sb.batch_name, sb.batch_level, 
                         spt.is_on_penalty, spt.homework_miss_count, spt.failed_assessment_count
                ORDER BY sub.subject_name
            `, [studentRoll, studentRoll, studentRoll, studentRoll, studentInfo[0].section_id]);

            // Get upcoming assessments
            const [upcomingAssessments] = await db.execute(`
                SELECT 
                    saq.*, th.topic_name, sub.subject_name, v.name as venue_name,
                    DATEDIFF(saq.scheduled_date, CURDATE()) as days_until_assessment
                FROM student_assessment_queue saq
                JOIN topic_hierarchy th ON saq.topic_id = th.id
                JOIN subjects sub ON saq.subject_id = sub.id
                LEFT JOIN venues v ON saq.venue_id = v.id
                WHERE saq.student_roll = ?
                AND saq.status IN ('Requested', 'Scheduled')
                AND saq.scheduled_date >= CURDATE()
                ORDER BY saq.scheduled_date, saq.scheduled_time
                LIMIT 5
            `, [studentRoll]);

            // Get recent homework assignments
            const [recentHomework] = await db.execute(`
                SELECT 
                    sht.*, th.homework_title, topic.topic_name, sub.subject_name,
                    DATEDIFF(sht.due_date, CURDATE()) as days_until_due,
                    CASE 
                        WHEN sht.due_date < CURDATE() AND sht.status IN ('Assigned') THEN 1
                        ELSE 0
                    END as is_overdue
                FROM student_homework_tracking sht
                JOIN topic_homework th ON sht.homework_id = th.id
                JOIN topic_hierarchy topic ON th.topic_id = topic.id
                JOIN subjects sub ON topic.subject_id = sub.id
                WHERE sht.student_roll = ?
                AND sht.status IN ('Assigned', 'Submitted', 'Late_Submitted')
                ORDER BY sht.due_date ASC
                LIMIT 10
            `, [studentRoll]);

            // Get recent achievements/completions
            const [recentCompletions] = await db.execute(`
                SELECT 
                    stch.*, th.topic_name, sub.subject_name,
                    CASE 
                        WHEN stch.days_late <= 0 THEN 'On Time'
                        WHEN stch.days_late <= 2 THEN 'Slightly Late'
                        WHEN stch.days_late <= 5 THEN 'Late'
                        ELSE 'Very Late'
                    END as timing_label
                FROM student_topic_completion_history stch
                JOIN topic_hierarchy th ON stch.topic_id = th.id
                JOIN subjects sub ON th.subject_id = sub.id
                WHERE stch.student_roll = ?
                ORDER BY stch.actual_completion_date DESC
                LIMIT 10
            `, [studentRoll]);

            res.json({
                success: true,
                data: {
                    student_info: studentInfo[0],
                    subject_progress: subjectProgress,
                    upcoming_assessments: upcomingAssessments,
                    recent_homework: recentHomework,
                    recent_completions: recentCompletions
                }
            });
        } catch (error) {
            console.error('Get student dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch student dashboard',
                error: error.message
            });
        }
    }

    // Get detailed progress for a specific subject
    static async getSubjectProgress(req, res) {
        try {
            const { studentRoll, subjectId } = req.params;

            // Get subject info and student's current batch
            const [subjectInfo] = await db.execute(`
                SELECT 
                    sub.subject_name,
                    sb.batch_name, sb.batch_level,
                    spt.is_on_penalty, spt.homework_miss_count, spt.failed_assessment_count, spt.penalty_threshold
                FROM subjects sub
                LEFT JOIN student_batch_assignments sba ON sba.student_roll = ? AND sba.is_current = 1
                LEFT JOIN section_batches sb ON sba.batch_id = sb.id AND sb.subject_id = sub.id
                LEFT JOIN student_penalty_tracking spt ON spt.student_roll = ? AND spt.subject_id = sub.id
                WHERE sub.id = ?
            `, [studentRoll, studentRoll, subjectId]);

            // Get hierarchical topic progress
            const [topicProgress] = await db.execute(`
                WITH RECURSIVE topic_tree AS (
                    SELECT 
                        th.id, th.parent_id, th.level, th.topic_name, th.topic_code, th.order_sequence,
                        th.has_assessment, th.has_homework, th.is_bottom_level,
                        stp.status, stp.completion_percentage, stp.last_assessment_score, stp.completed_at,
                        0 as depth, CAST(th.topic_name AS CHAR(1000)) as path
                    FROM topic_hierarchy th
                    LEFT JOIN student_topic_progress stp ON th.id = stp.topic_id AND stp.student_roll = ?
                    WHERE th.subject_id = ? AND th.parent_id IS NULL
                    
                    UNION ALL
                    
                    SELECT 
                        th.id, th.parent_id, th.level, th.topic_name, th.topic_code, th.order_sequence,
                        th.has_assessment, th.has_homework, th.is_bottom_level,
                        stp.status, stp.completion_percentage, stp.last_assessment_score, stp.completed_at,
                        tt.depth + 1, CONCAT(tt.path, ' > ', th.topic_name)
                    FROM topic_hierarchy th
                    INNER JOIN topic_tree tt ON th.parent_id = tt.id
                    LEFT JOIN student_topic_progress stp ON th.id = stp.topic_id AND stp.student_roll = ?
                )
                SELECT * FROM topic_tree 
                ORDER BY level, order_sequence
            `, [studentRoll, subjectId, studentRoll]);

            // Get homework status for this subject
            const [homeworkStatus] = await db.execute(`
                SELECT 
                    COUNT(*) as total_homework,
                    SUM(CASE WHEN status = 'Marked_Complete' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'Missing' THEN 1 ELSE 0 END) as missing,
                    SUM(CASE WHEN status IN ('Assigned', 'Submitted') THEN 1 ELSE 0 END) as pending,
                    AVG(CASE WHEN mentor_score IS NOT NULL THEN mentor_score ELSE NULL END) as avg_score
                FROM student_homework_tracking sht
                JOIN topic_homework th ON sht.homework_id = th.id
                JOIN topic_hierarchy topic ON th.topic_id = topic.id
                WHERE sht.student_roll = ? AND topic.subject_id = ?
            `, [studentRoll, subjectId]);

            // Get assessment history for this subject
            const [assessmentHistory] = await db.execute(`
                SELECT 
                    sa.*, th.topic_name, th.topic_code,
                    (sa.score / sa.max_score * 100) as percentage
                FROM student_assessments sa
                JOIN topic_hierarchy th ON sa.topic_id = th.id
                WHERE sa.student_roll = ? AND th.subject_id = ?
                ORDER BY sa.assessment_date DESC
                LIMIT 10
            `, [studentRoll, subjectId]);

            res.json({
                success: true,
                data: {
                    subject_info: subjectInfo[0] || {},
                    topic_progress: topicProgress,
                    homework_status: homeworkStatus[0] || {},
                    assessment_history: assessmentHistory
                }
            });
        } catch (error) {
            console.error('Get subject progress error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch subject progress',
                error: error.message
            });
        }
    }

    // Get today's schedule for student
    static async getTodaySchedule(req, res) {
        try {
            const { studentRoll } = req.params;
            const today = new Date().toISOString().split('T')[0];

            // Get student's section
            const [studentSection] = await db.execute(
                'SELECT section_id FROM students WHERE roll = ?',
                [studentRoll]
            );

            if (!studentSection.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const sectionId = studentSection[0].section_id;

            // Get today's schedule with activities
            const [schedule] = await db.execute(`
                SELECT 
                    ds.*, sub.subject_name, v.name as venue_name,
                    pa.id as activity_id, pa.activity_name, pa.activity_type, pa.batch_ids,
                    pa.start_time as activity_start_time, pa.duration, 
                    pa.activity_instructions, pa.is_assessment,
                    th.topic_name, tm.activity_name as material_name,
                    m.roll as mentor_roll,
                    -- Check if student is in the batch for this activity
                    CASE 
                        WHEN JSON_CONTAINS(pa.batch_ids, JSON_QUOTE(CAST(sba.batch_id AS CHAR))) THEN 1
                        ELSE 0
                    END as is_assigned_to_activity
                FROM daily_schedule_new ds
                JOIN subjects sub ON ds.subject_id = sub.id
                JOIN venues v ON ds.venue_id = v.id
                LEFT JOIN period_activities pa ON ds.id = pa.daily_schedule_id
                LEFT JOIN topic_hierarchy th ON pa.topic_id = th.id
                LEFT JOIN topic_materials tm ON pa.material_id = tm.id
                LEFT JOIN mentors m ON pa.assigned_mentor_id = m.id
                LEFT JOIN student_batch_assignments sba ON sba.student_roll = ? 
                    AND sba.is_current = 1
                LEFT JOIN section_batches sb ON sba.batch_id = sb.id 
                    AND sb.subject_id = ds.subject_id
                WHERE ds.date = ? AND ds.section_id = ?
                ORDER BY ds.period_number, pa.start_time
            `, [studentRoll, today, sectionId]);

            // Also check for any remedial sessions scheduled for today
            const [remedialSessions] = await db.execute(`
                SELECT 
                    rcs.*, sub.subject_name, v.name as venue_name,
                    m.roll as mentor_roll
                FROM remedial_classwork_sessions rcs
                JOIN subjects sub ON rcs.subject_id = sub.id
                LEFT JOIN venues v ON rcs.venue_id = v.id
                LEFT JOIN mentors m ON rcs.assigned_mentor_id = m.id
                WHERE rcs.student_roll = ? 
                AND rcs.session_date = ?
                AND rcs.status IN ('Scheduled', 'In_Progress')
                ORDER BY rcs.start_time
            `, [studentRoll, today]);

            res.json({
                success: true,
                data: {
                    regular_schedule: schedule,
                    remedial_sessions: remedialSessions
                }
            });
        } catch (error) {
            console.error('Get today schedule error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch today\'s schedule',
                error: error.message
            });
        }
    }

    // Request assessment for a topic
    static async requestAssessment(req, res) {
        try {
            const { studentRoll } = req.params;
            const { topicId, assessmentType, requestedDate, preferredTime } = req.body;

            // Check if student can take this assessment
            const [eligibilityCheck] = await db.execute(
                'SELECT can_take_assessment(?, ?, (SELECT subject_id FROM topic_hierarchy WHERE id = ?)) as can_assess',
                [studentRoll, topicId, topicId]
            );

            if (!eligibilityCheck[0].can_assess) {
                return res.status(400).json({
                    success: false,
                    message: 'You do not meet the prerequisites for this assessment. Please complete the required topics first.'
                });
            }

            // Check if there's already a pending request for this topic
            const [existingRequest] = await db.execute(
                'SELECT id FROM student_assessment_queue WHERE student_roll = ? AND topic_id = ? AND status IN ("Requested", "Scheduled")',
                [studentRoll, topicId]
            );

            if (existingRequest.length) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have a pending assessment request for this topic'
                });
            }

            // Add to assessment queue
            const query = `
                INSERT INTO student_assessment_queue 
                (student_roll, topic_id, subject_id, assessment_type, requested_date, status)
                VALUES (?, ?, (SELECT subject_id FROM topic_hierarchy WHERE id = ?), ?, ?, 'Requested')
            `;

            await db.execute(query, [studentRoll, topicId, topicId, assessmentType, requestedDate]);

            res.json({
                success: true,
                message: 'Assessment request submitted successfully. You will be notified once it is scheduled.'
            });
        } catch (error) {
            console.error('Request assessment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit assessment request',
                error: error.message
            });
        }
    }

    // Submit homework
    static async submitHomework(req, res) {
        try {
            const { trackingId } = req.params;
            const { submissionNotes, attachmentUrl } = req.body;
            const studentRoll = req.user.roll; // From authentication

            // Check if homework belongs to this student
            const [homeworkCheck] = await db.execute(
                'SELECT student_roll, due_date, status FROM student_homework_tracking WHERE id = ?',
                [trackingId]
            );

            if (!homeworkCheck.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Homework assignment not found'
                });
            }

            if (homeworkCheck[0].student_roll !== studentRoll) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to submit this homework'
                });
            }

            if (homeworkCheck[0].status !== 'Assigned') {
                return res.status(400).json({
                    success: false,
                    message: 'This homework has already been submitted'
                });
            }

            // Update homework status
            const newStatus = new Date() <= new Date(homeworkCheck[0].due_date) ? 'Submitted' : 'Late_Submitted';
            
            const query = `
                UPDATE student_homework_tracking 
                SET status = ?, submission_date = CURDATE(), attempts_used = attempts_used + 1
                WHERE id = ?
            `;

            await db.execute(query, [newStatus, trackingId]);

            res.json({
                success: true,
                message: newStatus === 'Submitted' ? 'Homework submitted successfully' : 'Homework submitted late but recorded'
            });
        } catch (error) {
            console.error('Submit homework error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit homework',
                error: error.message
            });
        }
    }

    // Get student performance analytics
    static async getPerformanceAnalytics(req, res) {
        try {
            const { studentRoll } = req.params;
            const { period = 'month' } = req.query; // week, month, term

            let dateFilter = '';
            if (period === 'week') {
                dateFilter = 'AND DATE(stch.actual_completion_date) >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
            } else if (period === 'month') {
                dateFilter = 'AND DATE(stch.actual_completion_date) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
            } else if (period === 'term') {
                dateFilter = 'AND DATE(stch.actual_completion_date) >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
            }

            // Overall performance metrics
            const [overallMetrics] = await db.execute(`
                SELECT 
                    COUNT(DISTINCT stch.topic_id) as topics_completed,
                    AVG(stch.final_score) as avg_score,
                    SUM(CASE WHEN stch.completion_status = 'On_Time' THEN 1 ELSE 0 END) as on_time_completions,
                    SUM(CASE WHEN stch.completion_status = 'Late' THEN 1 ELSE 0 END) as late_completions,
                    SUM(CASE WHEN stch.completion_status = 'Very_Late' THEN 1 ELSE 0 END) as very_late_completions,
                    AVG(stch.days_taken) as avg_days_taken
                FROM student_topic_completion_history stch
                WHERE stch.student_roll = ?
                ${dateFilter}
            `, [studentRoll]);

            // Subject-wise performance
            const [subjectPerformance] = await db.execute(`
                SELECT 
                    sub.subject_name,
                    COUNT(DISTINCT stch.topic_id) as topics_completed,
                    AVG(stch.final_score) as avg_score,
                    AVG(stch.days_taken) as avg_days_taken,
                    SUM(CASE WHEN stch.completion_status = 'On_Time' THEN 1 ELSE 0 END) as on_time_count,
                    sb.batch_name, sb.batch_level
                FROM student_topic_completion_history stch
                JOIN topic_hierarchy th ON stch.topic_id = th.id
                JOIN subjects sub ON th.subject_id = sub.id
                LEFT JOIN student_batch_assignments sba ON sba.student_roll = stch.student_roll AND sba.is_current = 1
                LEFT JOIN section_batches sb ON sba.batch_id = sb.id AND sb.subject_id = sub.id
                WHERE stch.student_roll = ?
                ${dateFilter}
                GROUP BY sub.id, sub.subject_name, sb.batch_name, sb.batch_level
                ORDER BY avg_score DESC
            `, [studentRoll]);

            // Daily progress trend
            const [progressTrend] = await db.execute(`
                SELECT 
                    DATE(stch.actual_completion_date) as completion_date,
                    COUNT(*) as topics_completed,
                    AVG(stch.final_score) as avg_score
                FROM student_topic_completion_history stch
                WHERE stch.student_roll = ?
                AND stch.actual_completion_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(stch.actual_completion_date)
                ORDER BY completion_date DESC
            `, [studentRoll]);

            res.json({
                success: true,
                data: {
                    overall_metrics: overallMetrics[0] || {},
                    subject_performance: subjectPerformance,
                    progress_trend: progressTrend
                }
            });
        } catch (error) {
            console.error('Get performance analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch performance analytics',
                error: error.message
            });
        }
    }
}

module.exports = StudentDashboardController;
