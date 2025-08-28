const db = require('../../config/db');

class HomeworkController {
    // Create homework assignment
    static async createHomework(req, res) {
        try {
            const { topicId, homeworkTitle, description, fileUrl, estimatedDuration, maxAttempts } = req.body;
            
            // Verify topic is bottom level (only bottom level topics can have homework)
            const [topicCheck] = await db.execute(
                'SELECT is_bottom_level, subject_id FROM topic_hierarchy WHERE id = ?',
                [topicId]
            );
            
            if (!topicCheck.length || !topicCheck[0].is_bottom_level) {
                return res.status(400).json({
                    success: false,
                    message: 'Homework can only be assigned to bottom level topics'
                });
            }

            const query = `
                INSERT INTO topic_homework 
                (topic_id, homework_title, description, file_url, estimated_duration, max_attempts)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                topicId, homeworkTitle, description, fileUrl, estimatedDuration, maxAttempts
            ]);

            res.json({
                success: true,
                message: 'Homework created successfully',
                data: { homeworkId: result.insertId }
            });
        } catch (error) {
            console.error('Create homework error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create homework',
                error: error.message
            });
        }
    }

    // Assign homework to students
    static async assignHomework(req, res) {
        try {
            const { homeworkId, studentRolls, dueDate } = req.body;
            
            // Get homework details
            const [homeworkDetails] = await db.execute(`
                SELECT th.*, th.subject_id 
                FROM topic_homework th
                JOIN topic_hierarchy t ON th.topic_id = t.id
                WHERE th.id = ?
            `, [homeworkId]);
            
            if (!homeworkDetails.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Homework not found'
                });
            }
            
            const homework = homeworkDetails[0];
            const assignedDate = new Date().toISOString().split('T')[0];

            // Assign to each student
            const assignments = [];
            for (const studentRoll of studentRolls) {
                assignments.push([
                    studentRoll, homeworkId, homework.subject_id, assignedDate, dueDate, 'Assigned'
                ]);
            }

            const query = `
                INSERT INTO student_homework_tracking 
                (student_roll, homework_id, subject_id, assigned_date, due_date, status)
                VALUES ?
            `;

            await db.execute(query, [assignments]);

            res.json({
                success: true,
                message: `Homework assigned to ${studentRolls.length} students successfully`
            });
        } catch (error) {
            console.error('Assign homework error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to assign homework',
                error: error.message
            });
        }
    }

    // Get homework assignments for mentor marking
    static async getHomeworkForMarking(req, res) {
        try {
            const { mentorId } = req.params;
            const { status, subjectId, dueDate } = req.query;

            let whereConditions = ['mgsa.mentor_id = ?', 'mgsa.is_active = 1'];
            let queryParams = [mentorId];

            if (status) {
                whereConditions.push('sht.status = ?');
                queryParams.push(status);
            }

            if (subjectId) {
                whereConditions.push('sht.subject_id = ?');
                queryParams.push(subjectId);
            }

            if (dueDate) {
                whereConditions.push('sht.due_date = ?');
                queryParams.push(dueDate);
            }

            const query = `
                SELECT 
                    sht.*, th.homework_title, th.description, th.file_url,
                    topic.topic_name, topic.topic_code,
                    s.name as student_name, s.roll as student_roll,
                    sub.subject_name,
                    DATEDIFF(sht.due_date, CURDATE()) as days_until_due,
                    CASE 
                        WHEN sht.submission_date > sht.due_date THEN DATEDIFF(sht.submission_date, sht.due_date)
                        WHEN sht.due_date < CURDATE() AND sht.status IN ('Assigned', 'Submitted') THEN DATEDIFF(CURDATE(), sht.due_date)
                        ELSE 0
                    END as days_late
                FROM student_homework_tracking sht
                JOIN topic_homework th ON sht.homework_id = th.id
                JOIN topic_hierarchy topic ON th.topic_id = topic.id
                JOIN subjects sub ON sht.subject_id = sub.id
                JOIN students s ON sht.student_roll = s.roll
                JOIN mentor_grade_subject_assignments mgsa ON sht.subject_id = mgsa.subject_id 
                    AND s.section_id IN (
                        SELECT section_id FROM sections WHERE grade_id = mgsa.grade_id
                    )
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY sht.due_date DESC, sht.assigned_date DESC
            `;

            const [homework] = await db.execute(query, queryParams);

            res.json({
                success: true,
                data: homework
            });
        } catch (error) {
            console.error('Get homework for marking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch homework assignments',
                error: error.message
            });
        }
    }

    // Mark homework completion
    static async markHomework(req, res) {
        try {
            const { trackingId } = req.params;
            const { status, mentorScore, mentorFeedback } = req.body;
            const mentorId = req.user.id;

            // Calculate days late
            const [trackingDetails] = await db.execute(
                'SELECT due_date, submission_date FROM student_homework_tracking WHERE id = ?',
                [trackingId]
            );

            if (!trackingDetails.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Homework tracking record not found'
                });
            }

            const { due_date, submission_date } = trackingDetails[0];
            let daysLate = 0;

            if (submission_date && new Date(submission_date) > new Date(due_date)) {
                daysLate = Math.ceil((new Date(submission_date) - new Date(due_date)) / (1000 * 60 * 60 * 24));
            }

            const query = `
                UPDATE student_homework_tracking 
                SET status = ?, mentor_score = ?, mentor_feedback = ?, 
                    marked_by_mentor_id = ?, marked_date = CURDATE(), days_late = ?
                WHERE id = ?
            `;

            await db.execute(query, [
                status, mentorScore, mentorFeedback, mentorId, daysLate, trackingId
            ]);

            res.json({
                success: true,
                message: 'Homework marked successfully'
            });
        } catch (error) {
            console.error('Mark homework error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to mark homework',
                error: error.message
            });
        }
    }

    // Get student homework assignments
    static async getStudentHomework(req, res) {
        try {
            const { studentRoll } = req.params;
            const { status, subjectId } = req.query;

            let whereConditions = ['sht.student_roll = ?'];
            let queryParams = [studentRoll];

            if (status) {
                whereConditions.push('sht.status = ?');
                queryParams.push(status);
            }

            if (subjectId) {
                whereConditions.push('sht.subject_id = ?');
                queryParams.push(subjectId);
            }

            const query = `
                SELECT 
                    sht.*, th.homework_title, th.description, th.file_url, th.estimated_duration, th.max_attempts,
                    topic.topic_name, topic.topic_code,
                    sub.subject_name,
                    DATEDIFF(sht.due_date, CURDATE()) as days_until_due,
                    CASE 
                        WHEN sht.due_date < CURDATE() AND sht.status IN ('Assigned') THEN 1
                        ELSE 0
                    END as is_overdue
                FROM student_homework_tracking sht
                JOIN topic_homework th ON sht.homework_id = th.id
                JOIN topic_hierarchy topic ON th.topic_id = topic.id
                JOIN subjects sub ON sht.subject_id = sub.id
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY sht.due_date ASC, sht.assigned_date DESC
            `;

            const [homework] = await db.execute(query, queryParams);

            res.json({
                success: true,
                data: homework
            });
        } catch (error) {
            console.error('Get student homework error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch student homework',
                error: error.message
            });
        }
    }

    // Submit homework (by student)
    static async submitHomework(req, res) {
        try {
            const { trackingId } = req.params;
            const { submissionNotes, attachmentUrl } = req.body;

            const query = `
                UPDATE student_homework_tracking 
                SET status = CASE 
                    WHEN due_date >= CURDATE() THEN 'Submitted'
                    ELSE 'Late_Submitted'
                END,
                submission_date = CURDATE(),
                attempts_used = attempts_used + 1
                WHERE id = ? AND student_roll = ?
            `;

            const studentRoll = req.user.roll; // Assuming student is authenticated
            await db.execute(query, [trackingId, studentRoll]);

            res.json({
                success: true,
                message: 'Homework submitted successfully'
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

    // Get homework statistics
    static async getHomeworkStatistics(req, res) {
        try {
            const { subjectId, gradeId, sectionId } = req.params;
            const { startDate, endDate } = req.query;

            let whereConditions = ['sub.id = ?'];
            let queryParams = [subjectId];

            if (startDate && endDate) {
                whereConditions.push('sht.assigned_date BETWEEN ? AND ?');
                queryParams.push(startDate, endDate);
            }

            if (sectionId) {
                whereConditions.push('s.section_id = ?');
                queryParams.push(sectionId);
            } else if (gradeId) {
                whereConditions.push('sec.grade_id = ?');
                queryParams.push(gradeId);
            }

            const query = `
                SELECT 
                    COUNT(*) as total_assignments,
                    SUM(CASE WHEN sht.status = 'Marked_Complete' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN sht.status = 'Missing' THEN 1 ELSE 0 END) as missing,
                    SUM(CASE WHEN sht.status IN ('Late_Submitted', 'Marked_Incomplete') THEN 1 ELSE 0 END) as late_or_incomplete,
                    SUM(CASE WHEN sht.status IN ('Assigned', 'Submitted') THEN 1 ELSE 0 END) as pending,
                    AVG(CASE WHEN sht.mentor_score IS NOT NULL THEN sht.mentor_score ELSE NULL END) as avg_score,
                    AVG(sht.days_late) as avg_days_late
                FROM student_homework_tracking sht
                JOIN topic_homework th ON sht.homework_id = th.id
                JOIN topic_hierarchy topic ON th.topic_id = topic.id
                JOIN subjects sub ON topic.subject_id = sub.id
                JOIN students s ON sht.student_roll = s.roll
                JOIN sections sec ON s.section_id = sec.id
                WHERE ${whereConditions.join(' AND ')}
            `;

            const [stats] = await db.execute(query, queryParams);

            res.json({
                success: true,
                data: stats[0]
            });
        } catch (error) {
            console.error('Get homework statistics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch homework statistics',
                error: error.message
            });
        }
    }

    // Get overdue homework report
    static async getOverdueHomework(req, res) {
        try {
            const { mentorId } = req.params;

            const query = `
                SELECT 
                    sht.student_roll, s.name as student_name,
                    th.homework_title, topic.topic_name,
                    sub.subject_name,
                    sht.assigned_date, sht.due_date,
                    DATEDIFF(CURDATE(), sht.due_date) as days_overdue,
                    sb.batch_name, sb.batch_level
                FROM student_homework_tracking sht
                JOIN topic_homework th ON sht.homework_id = th.id
                JOIN topic_hierarchy topic ON th.topic_id = topic.id
                JOIN subjects sub ON topic.subject_id = sub.id
                JOIN students s ON sht.student_roll = s.roll
                JOIN mentor_grade_subject_assignments mgsa ON sub.id = mgsa.subject_id 
                    AND s.section_id IN (
                        SELECT section_id FROM sections WHERE grade_id = mgsa.grade_id
                    )
                LEFT JOIN student_batch_assignments sba ON s.roll = sba.student_roll AND sba.is_current = 1
                LEFT JOIN section_batches sb ON sba.batch_id = sb.id AND sb.subject_id = sub.id
                WHERE mgsa.mentor_id = ? 
                AND mgsa.is_active = 1
                AND sht.due_date < CURDATE()
                AND sht.status IN ('Assigned', 'Submitted')
                ORDER BY days_overdue DESC, sht.due_date ASC
            `;

            const [overdueHomework] = await db.execute(query, [mentorId]);

            res.json({
                success: true,
                data: overdueHomework
            });
        } catch (error) {
            console.error('Get overdue homework error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch overdue homework',
                error: error.message
            });
        }
    }

    // Get homework analytics for coordinator
    static async getHomeworkAnalytics(req, res) {
        try {
            const { gradeId, subjectId } = req.params;
            const { period } = req.query; // 'week', 'month', 'term'

            let dateFilter = '';
            if (period === 'week') {
                dateFilter = 'AND sht.assigned_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
            } else if (period === 'month') {
                dateFilter = 'AND sht.assigned_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
            } else if (period === 'term') {
                dateFilter = 'AND sht.assigned_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
            }

            const query = `
                SELECT 
                    sec.section_name,
                    sb.batch_name,
                    COUNT(*) as total_assignments,
                    SUM(CASE WHEN sht.status = 'Marked_Complete' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN sht.status = 'Missing' THEN 1 ELSE 0 END) as missing,
                    SUM(CASE WHEN sht.days_late > 0 THEN 1 ELSE 0 END) as late_submissions,
                    AVG(CASE WHEN sht.mentor_score IS NOT NULL THEN sht.mentor_score ELSE NULL END) as avg_score,
                    COUNT(DISTINCT sht.student_roll) as unique_students
                FROM student_homework_tracking sht
                JOIN topic_homework th ON sht.homework_id = th.id
                JOIN topic_hierarchy topic ON th.topic_id = topic.id
                JOIN students s ON sht.student_roll = s.roll
                JOIN sections sec ON s.section_id = sec.id
                LEFT JOIN student_batch_assignments sba ON s.roll = sba.student_roll AND sba.is_current = 1
                LEFT JOIN section_batches sb ON sba.batch_id = sb.id AND sb.subject_id = ?
                WHERE sec.grade_id = ? 
                AND topic.subject_id = ?
                ${dateFilter}
                GROUP BY sec.section_name, sb.batch_name
                ORDER BY sec.section_name, sb.batch_level
            `;

            const [analytics] = await db.execute(query, [subjectId, gradeId, subjectId]);

            res.json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Get homework analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch homework analytics',
                error: error.message
            });
        }
    }
}

module.exports = HomeworkController;
