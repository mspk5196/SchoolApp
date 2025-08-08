const db = require('../../config/db');

class AssessmentController {
    // Schedule assessment
    static async scheduleAssessment(req, res) {
        try {
            const {
                studentRoll, topicId, assessmentType, assessmentDate, 
                assessmentTime, venueId, maxScore, passScore
            } = req.body;
            
            // Check if student can take this assessment
            const [eligibilityCheck] = await db.execute(
                'SELECT can_take_assessment(?, ?, (SELECT subject_id FROM topic_hierarchy WHERE id = ?)) as can_assess',
                [studentRoll, topicId, topicId]
            );
            
            if (!eligibilityCheck[0].can_assess) {
                return res.status(400).json({
                    success: false,
                    message: 'Student does not meet prerequisites for this assessment'
                });
            }

            // Schedule assessment
            const query = `
                INSERT INTO student_assessments 
                (student_roll, topic_id, assessment_type, max_score, pass_score, assessment_date, status)
                VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')
            `;

            const [result] = await db.execute(query, [
                studentRoll, topicId, assessmentType, maxScore, passScore, assessmentDate
            ]);

            // Add to assessment queue
            await db.execute(`
                INSERT INTO student_assessment_queue 
                (student_roll, topic_id, subject_id, assessment_type, scheduled_date, scheduled_time, venue_id, status)
                VALUES (?, ?, (SELECT subject_id FROM topic_hierarchy WHERE id = ?), ?, ?, ?, ?, 'Scheduled')
            `, [studentRoll, topicId, topicId, assessmentType, assessmentDate, assessmentTime, venueId]);

            res.json({
                success: true,
                message: 'Assessment scheduled successfully',
                data: { assessmentId: result.insertId }
            });
        } catch (error) {
            console.error('Schedule assessment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to schedule assessment',
                error: error.message
            });
        }
    }

    // Record assessment score
    static async recordAssessmentScore(req, res) {
        try {
            const { assessmentId } = req.params;
            const { score, attemptNumber, mentorFeedback } = req.body;
            const mentorId = req.user.id;

            // Get assessment details
            const [assessmentDetails] = await db.execute(
                'SELECT * FROM student_assessments WHERE id = ?',
                [assessmentId]
            );

            if (!assessmentDetails.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Assessment not found'
                });
            }

            const assessment = assessmentDetails[0];
            const percentage = (score / assessment.max_score) * 100;
            const status = percentage >= assessment.pass_score ? 'Passed' : 'Failed';

            // Update assessment
            const updateQuery = `
                UPDATE student_assessments 
                SET score = ?, status = ?, attempt_number = ?, completed_at = NOW(),
                    next_retake_date = CASE WHEN ? = 'Failed' THEN DATE_ADD(CURDATE(), INTERVAL 3 DAY) ELSE NULL END
                WHERE id = ?
            `;

            await db.execute(updateQuery, [score, status, attemptNumber, status, assessmentId]);

            // Update student progress
            if (status === 'Passed') {
                await this.updateStudentProgressOnPass(assessment.student_roll, assessment.topic_id, percentage);
            } else {
                await this.updatePenaltyOnFail(assessment.student_roll, assessment.topic_id);
            }

            res.json({
                success: true,
                message: 'Assessment score recorded successfully',
                data: { status, percentage }
            });
        } catch (error) {
            console.error('Record assessment score error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to record assessment score',
                error: error.message
            });
        }
    }

    // Update student progress when assessment is passed
    static async updateStudentProgressOnPass(studentRoll, topicId, score) {
        try {
            // Update topic progress
            await db.execute(`
                INSERT INTO student_topic_progress 
                (student_roll, topic_id, subject_id, status, completion_percentage, last_assessment_score, completed_at)
                VALUES (?, ?, (SELECT subject_id FROM topic_hierarchy WHERE id = ?), 'Completed', 100, ?, NOW())
                ON DUPLICATE KEY UPDATE
                status = 'Completed',
                completion_percentage = 100,
                last_assessment_score = VALUES(last_assessment_score),
                completed_at = NOW()
            `, [studentRoll, topicId, topicId, score]);

            // Record completion history
            await db.execute(`
                INSERT INTO student_topic_completion_history
                (student_roll, topic_id, subject_id, level_type, started_date, expected_completion_date,
                 actual_completion_date, days_taken, days_late, completion_status, final_score)
                SELECT 
                    ?, th.id, th.subject_id,
                    CASE 
                        WHEN th.level = 1 THEN 'Level'
                        WHEN th.parent_id IS NULL THEN 'Topic'
                        WHEN th.is_bottom_level = 1 THEN 'Sub_Sub_Topic'
                        ELSE 'Sub_Topic'
                    END,
                    COALESCE(stp_existing.created_at, DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY)),
                    DATE_ADD(COALESCE(stp_existing.created_at, DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY)), INTERVAL th.expected_completion_days DAY),
                    CURDATE(),
                    DATEDIFF(CURDATE(), COALESCE(stp_existing.created_at, DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY))),
                    GREATEST(0, DATEDIFF(CURDATE(), DATE_ADD(COALESCE(stp_existing.created_at, DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY)), INTERVAL th.expected_completion_days DAY))),
                    CASE 
                        WHEN DATEDIFF(CURDATE(), DATE_ADD(COALESCE(stp_existing.created_at, DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY)), INTERVAL th.expected_completion_days DAY)) <= 0 THEN 'On_Time'
                        WHEN DATEDIFF(CURDATE(), DATE_ADD(COALESCE(stp_existing.created_at, DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY)), INTERVAL th.expected_completion_days DAY)) <= 2 THEN 'Late'
                        ELSE 'Very_Late'
                    END,
                    ?
                FROM topic_hierarchy th
                LEFT JOIN (
                    SELECT topic_id, MIN(created_at) as created_at 
                    FROM student_topic_progress 
                    WHERE student_roll = ? AND topic_id = ?
                ) stp_existing ON th.id = stp_existing.topic_id
                WHERE th.id = ?
            `, [studentRoll, score, studentRoll, topicId, topicId]);
        } catch (error) {
            console.error('Update student progress on pass error:', error);
        }
    }

    // Update penalty tracking when assessment fails
    static async updatePenaltyOnFail(studentRoll, topicId) {
        try {
            const [subjectInfo] = await db.execute(
                'SELECT subject_id FROM topic_hierarchy WHERE id = ?',
                [topicId]
            );

            const [gradeInfo] = await db.execute(
                'SELECT grade_id FROM students s JOIN sections sec ON s.section_id = sec.id WHERE s.roll = ?',
                [studentRoll]
            );

            if (subjectInfo.length && gradeInfo.length) {
                // This will trigger the penalty update via trigger
                // But we can also call the remedial assignment procedure
                await db.execute(
                    'CALL assign_remedial_session(?, ?, ?, ?)',
                    [studentRoll, subjectInfo[0].subject_id, gradeInfo[0].grade_id, 'Assessment_Failed']
                );
            }
        } catch (error) {
            console.error('Update penalty on fail error:', error);
        }
    }

    // Get scheduled assessments
    static async getScheduledAssessments(req, res) {
        try {
            const { mentorId } = req.params;
            const { date, status } = req.query;

            let whereConditions = ['mgsa.mentor_id = ?', 'mgsa.is_active = 1'];
            let queryParams = [mentorId];

            if (date) {
                whereConditions.push('saq.scheduled_date = ?');
                queryParams.push(date);
            }

            if (status) {
                whereConditions.push('saq.status = ?');
                queryParams.push(status);
            }

            const query = `
                SELECT 
                    saq.*, sa.id as assessment_id, sa.max_score, sa.pass_score, sa.attempt_number,
                    th.topic_name, th.topic_code, sub.subject_name,
                    s.name as student_name, s.roll as student_roll,
                    v.name as venue_name, v.capacity,
                    CASE 
                        WHEN saq.scheduled_date = CURDATE() THEN 'Today'
                        WHEN saq.scheduled_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 'Tomorrow'
                        WHEN saq.scheduled_date < CURDATE() THEN 'Overdue'
                        ELSE 'Upcoming'
                    END as timing_status
                FROM student_assessment_queue saq
                JOIN student_assessments sa ON saq.student_roll = sa.student_roll AND saq.topic_id = sa.topic_id
                JOIN topic_hierarchy th ON saq.topic_id = th.id
                JOIN subjects sub ON saq.subject_id = sub.id
                JOIN students s ON saq.student_roll = s.roll
                JOIN mentor_grade_subject_assignments mgsa ON sub.id = mgsa.subject_id 
                    AND s.section_id IN (
                        SELECT section_id FROM sections WHERE grade_id = mgsa.grade_id
                    )
                LEFT JOIN venues v ON saq.venue_id = v.id
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY saq.scheduled_date, saq.scheduled_time
            `;

            const [assessments] = await db.execute(query, queryParams);

            res.json({
                success: true,
                data: assessments
            });
        } catch (error) {
            console.error('Get scheduled assessments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch scheduled assessments',
                error: error.message
            });
        }
    }

    // Get student assessment history
    static async getStudentAssessmentHistory(req, res) {
        try {
            const { studentRoll } = req.params;
            const { subjectId } = req.query;

            let whereConditions = ['sa.student_roll = ?'];
            let queryParams = [studentRoll];

            if (subjectId) {
                whereConditions.push('th.subject_id = ?');
                queryParams.push(subjectId);
            }

            const query = `
                SELECT 
                    sa.*, th.topic_name, th.topic_code, sub.subject_name,
                    (sa.score / sa.max_score * 100) as percentage,
                    CASE 
                        WHEN sa.status = 'Passed' THEN 'success'
                        WHEN sa.status = 'Failed' THEN 'danger'
                        WHEN sa.status = 'Scheduled' THEN 'warning'
                        ELSE 'info'
                    END as status_color
                FROM student_assessments sa
                JOIN topic_hierarchy th ON sa.topic_id = th.id
                JOIN subjects sub ON th.subject_id = sub.id
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY sa.assessment_date DESC, sa.completed_at DESC
            `;

            const [history] = await db.execute(query, queryParams);

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            console.error('Get student assessment history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch assessment history',
                error: error.message
            });
        }
    }

    // Get assessment analytics
    static async getAssessmentAnalytics(req, res) {
        try {
            const { subjectId, gradeId } = req.params;
            const { period, topicId } = req.query;

            let dateFilter = '';
            if (period === 'week') {
                dateFilter = 'AND sa.assessment_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
            } else if (period === 'month') {
                dateFilter = 'AND sa.assessment_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
            }

            let topicFilter = '';
            let topicParam = [];
            if (topicId) {
                topicFilter = 'AND th.id = ?';
                topicParam = [topicId];
            }

            const query = `
                SELECT 
                    th.topic_name,
                    th.level,
                    COUNT(*) as total_assessments,
                    SUM(CASE WHEN sa.status = 'Passed' THEN 1 ELSE 0 END) as passed,
                    SUM(CASE WHEN sa.status = 'Failed' THEN 1 ELSE 0 END) as failed,
                    AVG(sa.score / sa.max_score * 100) as avg_percentage,
                    MIN(sa.score / sa.max_score * 100) as min_percentage,
                    MAX(sa.score / sa.max_score * 100) as max_percentage,
                    AVG(sa.attempt_number) as avg_attempts,
                    COUNT(DISTINCT sa.student_roll) as unique_students
                FROM student_assessments sa
                JOIN topic_hierarchy th ON sa.topic_id = th.id
                JOIN students s ON sa.student_roll = s.roll
                JOIN sections sec ON s.section_id = sec.id
                WHERE th.subject_id = ? 
                AND sec.grade_id = ?
                AND sa.status IN ('Passed', 'Failed')
                ${dateFilter}
                ${topicFilter}
                GROUP BY th.id, th.topic_name, th.level
                ORDER BY th.level, th.order_sequence
            `;

            const [analytics] = await db.execute(query, [subjectId, gradeId, ...topicParam]);

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Get assessment analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch assessment analytics',
                error: error.message
            });
        }
    }

    // Request assessment (by student)
    static async requestAssessment(req, res) {
        try {
            const { topicId, assessmentType, requestedDate } = req.body;
            const studentRoll = req.user.roll;

            // Check eligibility
            const [eligibilityCheck] = await db.execute(
                'SELECT can_take_assessment(?, ?, (SELECT subject_id FROM topic_hierarchy WHERE id = ?)) as can_assess',
                [studentRoll, topicId, topicId]
            );

            if (!eligibilityCheck[0].can_assess) {
                return res.status(400).json({
                    success: false,
                    message: 'You do not meet the prerequisites for this assessment'
                });
            }

            // Add to queue
            const query = `
                INSERT INTO student_assessment_queue 
                (student_roll, topic_id, subject_id, assessment_type, requested_date, status)
                VALUES (?, ?, (SELECT subject_id FROM topic_hierarchy WHERE id = ?), ?, ?, 'Requested')
            `;

            await db.execute(query, [studentRoll, topicId, topicId, assessmentType, requestedDate]);

            res.json({
                success: true,
                message: 'Assessment request submitted successfully'
            });
        } catch (error) {
            console.error('Request assessment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to request assessment',
                error: error.message
            });
        }
    }

    // Get assessment requests for coordinator approval
    static async getAssessmentRequests(req, res) {
        try {
            const { gradeId, subjectId } = req.params;
            const { status } = req.query;

            let whereConditions = ['sec.grade_id = ?', 'saq.subject_id = ?'];
            let queryParams = [gradeId, subjectId];

            if (status) {
                whereConditions.push('saq.status = ?');
                queryParams.push(status);
            }

            const query = `
                SELECT 
                    saq.*, th.topic_name, th.topic_code, sub.subject_name,
                    s.name as student_name, s.roll as student_roll,
                    sec.section_name,
                    DATEDIFF(saq.requested_date, CURDATE()) as days_until_requested
                FROM student_assessment_queue saq
                JOIN topic_hierarchy th ON saq.topic_id = th.id
                JOIN subjects sub ON saq.subject_id = sub.id
                JOIN students s ON saq.student_roll = s.roll
                JOIN sections sec ON s.section_id = sec.id
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY saq.created_at DESC
            `;

            const [requests] = await db.execute(query, queryParams);

            res.json({
                success: true,
                data: requests
            });
        } catch (error) {
            console.error('Get assessment requests error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch assessment requests',
                error: error.message
            });
        }
    }

    // Approve assessment request
    static async approveAssessmentRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { scheduledDate, scheduledTime, venueId, mentorId, maxScore, passScore } = req.body;

            // Update queue status
            await db.execute(
                'UPDATE student_assessment_queue SET status = ?, scheduled_date = ?, scheduled_time = ?, venue_id = ?, mentor_id = ? WHERE id = ?',
                ['Scheduled', scheduledDate, scheduledTime, venueId, mentorId, requestId]
            );

            // Create assessment record
            const [queueDetails] = await db.execute(
                'SELECT * FROM student_assessment_queue WHERE id = ?',
                [requestId]
            );

            if (queueDetails.length) {
                const queue = queueDetails[0];
                await db.execute(`
                    INSERT INTO student_assessments 
                    (student_roll, topic_id, assessment_type, max_score, pass_score, assessment_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')
                `, [queue.student_roll, queue.topic_id, queue.assessment_type, maxScore, passScore, scheduledDate]);
            }

            res.json({
                success: true,
                message: 'Assessment request approved and scheduled'
            });
        } catch (error) {
            console.error('Approve assessment request error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve assessment request',
                error: error.message
            });
        }
    }
}

module.exports = AssessmentController;
