const db = require('../../config/db');

class PenaltyController {
    // Get penalty status for all students
    static async getPenaltyStatus(req, res) {
        try {
            const { mentorId } = req.params;
            const { subjectId, status } = req.query;

            let whereConditions = ['mgsa.mentor_id = ?', 'mgsa.is_active = 1'];
            let queryParams = [mentorId];

            if (subjectId) {
                whereConditions.push('spt.subject_id = ?');
                queryParams.push(subjectId);
            }

            if (status) {
                if (status === 'on_penalty') {
                    whereConditions.push('spt.is_on_penalty = 1');
                } else if (status === 'at_risk') {
                    whereConditions.push('(spt.homework_miss_count >= spt.penalty_threshold - 1 OR spt.failed_assessment_count >= spt.penalty_threshold - 1)');
                    whereConditions.push('spt.is_on_penalty = 0');
                }
            }

            const query = `
                SELECT 
                    s.roll, s.name as student_name, s.profile_photo,
                    sub.subject_name, sec.section_name,
                    spt.homework_miss_count, spt.failed_assessment_count, spt.penalty_threshold,
                    spt.is_on_penalty, spt.penalty_start_date, spt.penalty_type,
                    sb.batch_name, sb.batch_level,
                    CASE 
                        WHEN spt.is_on_penalty = 1 THEN 'On Penalty'
                        WHEN spt.homework_miss_count >= spt.penalty_threshold - 1 OR spt.failed_assessment_count >= spt.penalty_threshold - 1 THEN 'At Risk'
                        ELSE 'Good Standing'
                    END as penalty_status,
                    COUNT(rcs.id) as remedial_sessions_scheduled,
                    SUM(CASE WHEN rcs.status = 'Completed' THEN 1 ELSE 0 END) as remedial_sessions_completed
                FROM students s
                JOIN sections sec ON s.section_id = sec.id
                JOIN mentor_grade_subject_assignments mgsa ON sec.grade_id = mgsa.grade_id
                JOIN subjects sub ON mgsa.subject_id = sub.id
                LEFT JOIN student_penalty_tracking spt ON s.roll = spt.student_roll AND sub.id = spt.subject_id
                LEFT JOIN student_batch_assignments sba ON s.roll = sba.student_roll AND sba.is_current = 1
                LEFT JOIN section_batches sb ON sba.batch_id = sb.id AND sb.subject_id = sub.id
                LEFT JOIN remedial_classwork_sessions rcs ON s.roll = rcs.student_roll AND sub.id = rcs.subject_id
                WHERE ${whereConditions.join(' AND ')}
                GROUP BY s.roll, s.name, sub.id, sub.subject_name, sec.section_name, 
                         spt.homework_miss_count, spt.failed_assessment_count, spt.penalty_threshold,
                         spt.is_on_penalty, spt.penalty_start_date, spt.penalty_type,
                         sb.batch_name, sb.batch_level
                ORDER BY spt.is_on_penalty DESC, spt.homework_miss_count DESC, spt.failed_assessment_count DESC
            `;

            const [penaltyStatus] = await db.execute(query, queryParams);

            res.json({
                success: true,
                data: penaltyStatus
            });
        } catch (error) {
            console.error('Get penalty status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch penalty status',
                error: error.message
            });
        }
    }

    // Get remedial sessions for mentor
    static async getRemedialSessions(req, res) {
        try {
            const { mentorId } = req.params;
            const { date, status } = req.query;

            let whereConditions = ['rcs.assigned_mentor_id = ?'];
            let queryParams = [mentorId];

            if (date) {
                whereConditions.push('rcs.session_date = ?');
                queryParams.push(date);
            }

            if (status) {
                whereConditions.push('rcs.status = ?');
                queryParams.push(status);
            }

            const query = `
                SELECT 
                    rcs.*, 
                    s.name as student_name, s.roll as student_roll,
                    sub.subject_name, g.grade_name,
                    v.name as venue_name, v.capacity,
                    ds.period_number as original_period,
                    JSON_UNQUOTE(JSON_EXTRACT(rcs.topics_to_cover, '$')) as topics_json,
                    CASE 
                        WHEN rcs.session_date = CURDATE() THEN 'Today'
                        WHEN rcs.session_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) THEN 'Tomorrow'
                        WHEN rcs.session_date < CURDATE() THEN 'Past'
                        ELSE 'Upcoming'
                    END as timing_status
                FROM remedial_classwork_sessions rcs
                JOIN students s ON rcs.student_roll = s.roll
                JOIN subjects sub ON rcs.subject_id = sub.id
                JOIN grades g ON rcs.grade_id = g.id
                LEFT JOIN venues v ON rcs.venue_id = v.id
                LEFT JOIN daily_schedule_new ds ON rcs.original_eca_schedule_id = ds.id
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY rcs.session_date, rcs.start_time
            `;

            const [sessions] = await db.execute(query, queryParams);

            // Parse topics for each session
            const sessionsWithTopics = sessions.map(session => {
                let topics = [];
                try {
                    if (session.topics_json) {
                        topics = JSON.parse(session.topics_json);
                    }
                } catch (e) {
                    topics = [];
                }
                
                return {
                    ...session,
                    topics_to_cover: topics
                };
            });

            res.json({
                success: true,
                data: sessionsWithTopics
            });
        } catch (error) {
            console.error('Get remedial sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch remedial sessions',
                error: error.message
            });
        }
    }

    // Update remedial session
    static async updateRemedialSession(req, res) {
        try {
            const { sessionId } = req.params;
            const { status, mentorNotes, topicsCovered } = req.body;

            const query = `
                UPDATE remedial_classwork_sessions 
                SET status = ?, mentor_notes = ?, topics_to_cover = ?
                WHERE id = ? AND assigned_mentor_id = ?
            `;

            const mentorId = req.user.id;
            await db.execute(query, [
                status, mentorNotes, JSON.stringify(topicsCovered), sessionId, mentorId
            ]);

            // If session is completed, check if penalty should be cleared
            if (status === 'Completed') {
                await this.checkPenaltyClearance(sessionId);
            }

            res.json({
                success: true,
                message: 'Remedial session updated successfully'
            });
        } catch (error) {
            console.error('Update remedial session error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update remedial session',
                error: error.message
            });
        }
    }

    // Check if penalty should be cleared after remedial session
    static async checkPenaltyClearance(sessionId) {
        try {
            // Get session details
            const [sessionDetails] = await db.execute(
                'SELECT student_roll, subject_id, penalty_reason FROM remedial_classwork_sessions WHERE id = ?',
                [sessionId]
            );

            if (!sessionDetails.length) return;

            const { student_roll, subject_id, penalty_reason } = sessionDetails[0];

            // Count completed remedial sessions
            const [completedSessions] = await db.execute(
                'SELECT COUNT(*) as count FROM remedial_classwork_sessions WHERE student_roll = ? AND subject_id = ? AND status = "Completed"',
                [student_roll, subject_id]
            );

            // If student has completed sufficient remedial sessions, clear penalty
            if (completedSessions[0].count >= 2) { // Configurable threshold
                await db.execute(
                    'UPDATE student_penalty_tracking SET is_on_penalty = 0, penalty_start_date = NULL WHERE student_roll = ? AND subject_id = ?',
                    [student_roll, subject_id]
                );
            }
        } catch (error) {
            console.error('Check penalty clearance error:', error);
        }
    }

    // Manually assign penalty
    static async assignPenalty(req, res) {
        try {
            const { studentRoll, subjectId, penaltyType, reason } = req.body;
            const coordinatorId = req.user.id;

            // Get grade ID
            const [gradeInfo] = await db.execute(
                'SELECT grade_id FROM students s JOIN sections sec ON s.section_id = sec.id WHERE s.roll = ?',
                [studentRoll]
            );

            if (!gradeInfo.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const gradeId = gradeInfo[0].grade_id;

            // Update or insert penalty
            await db.execute(`
                INSERT INTO student_penalty_tracking 
                (student_roll, subject_id, grade_id, penalty_type, is_on_penalty, penalty_start_date)
                VALUES (?, ?, ?, ?, 1, CURDATE())
                ON DUPLICATE KEY UPDATE
                penalty_type = VALUES(penalty_type),
                is_on_penalty = 1,
                penalty_start_date = CURDATE()
            `, [studentRoll, subjectId, gradeId, penaltyType]);

            // Assign remedial session
            await db.execute(
                'CALL assign_remedial_session(?, ?, ?, ?)',
                [studentRoll, subjectId, gradeId, penaltyType]
            );

            res.json({
                success: true,
                message: 'Penalty assigned and remedial session scheduled'
            });
        } catch (error) {
            console.error('Assign penalty error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to assign penalty',
                error: error.message
            });
        }
    }

    // Clear penalty manually
    static async clearPenalty(req, res) {
        try {
            const { studentRoll, subjectId } = req.body;
            const { reason } = req.body;

            await db.execute(
                'UPDATE student_penalty_tracking SET is_on_penalty = 0, penalty_start_date = NULL WHERE student_roll = ? AND subject_id = ?',
                [studentRoll, subjectId]
            );

            // Cancel pending remedial sessions
            await db.execute(
                'UPDATE remedial_classwork_sessions SET status = "Cancelled" WHERE student_roll = ? AND subject_id = ? AND status = "Scheduled"',
                [studentRoll, subjectId]
            );

            res.json({
                success: true,
                message: 'Penalty cleared successfully'
            });
        } catch (error) {
            console.error('Clear penalty error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to clear penalty',
                error: error.message
            });
        }
    }

    // Get penalty statistics
    static async getPenaltyStatistics(req, res) {
        try {
            const { gradeId, subjectId } = req.params;
            const { period } = req.query;

            let dateFilter = '';
            if (period === 'week') {
                dateFilter = 'AND spt.penalty_start_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
            } else if (period === 'month') {
                dateFilter = 'AND spt.penalty_start_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
            }

            const query = `
                SELECT 
                    COUNT(DISTINCT spt.student_roll) as total_students_with_penalties,
                    SUM(CASE WHEN spt.is_on_penalty = 1 THEN 1 ELSE 0 END) as currently_on_penalty,
                    SUM(CASE WHEN spt.penalty_type = 'Homework_Incomplete' THEN 1 ELSE 0 END) as homework_penalties,
                    SUM(CASE WHEN spt.penalty_type = 'Assessment_Failed' THEN 1 ELSE 0 END) as assessment_penalties,
                    SUM(CASE WHEN spt.penalty_type = 'Both' THEN 1 ELSE 0 END) as combined_penalties,
                    AVG(spt.homework_miss_count) as avg_homework_misses,
                    AVG(spt.failed_assessment_count) as avg_failed_assessments,
                    COUNT(DISTINCT rcs.id) as total_remedial_sessions,
                    SUM(CASE WHEN rcs.status = 'Completed' THEN 1 ELSE 0 END) as completed_remedial_sessions
                FROM student_penalty_tracking spt
                JOIN students s ON spt.student_roll = s.roll
                JOIN sections sec ON s.section_id = sec.id
                LEFT JOIN remedial_classwork_sessions rcs ON spt.student_roll = rcs.student_roll 
                    AND spt.subject_id = rcs.subject_id
                WHERE sec.grade_id = ? 
                AND spt.subject_id = ?
                ${dateFilter}
            `;

            const [statistics] = await db.execute(query, [gradeId, subjectId]);

            res.json({
                success: true,
                data: statistics[0]
            });
        } catch (error) {
            console.error('Get penalty statistics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch penalty statistics',
                error: error.message
            });
        }
    }

    // Get penalty trends
    static async getPenaltyTrends(req, res) {
        try {
            const { gradeId, subjectId } = req.params;

            const query = `
                SELECT 
                    DATE(spt.penalty_start_date) as penalty_date,
                    COUNT(*) as new_penalties,
                    SUM(CASE WHEN spt.penalty_type = 'Homework_Incomplete' THEN 1 ELSE 0 END) as homework_penalties,
                    SUM(CASE WHEN spt.penalty_type = 'Assessment_Failed' THEN 1 ELSE 0 END) as assessment_penalties
                FROM student_penalty_tracking spt
                JOIN students s ON spt.student_roll = s.roll
                JOIN sections sec ON s.section_id = sec.id
                WHERE sec.grade_id = ? 
                AND spt.subject_id = ?
                AND spt.penalty_start_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(spt.penalty_start_date)
                ORDER BY penalty_date DESC
            `;

            const [trends] = await db.execute(query, [gradeId, subjectId]);

            res.json({
                success: true,
                data: trends
            });
        } catch (error) {
            console.error('Get penalty trends error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch penalty trends',
                error: error.message
            });
        }
    }

    // Get student penalty history
    static async getStudentPenaltyHistory(req, res) {
        try {
            const { studentRoll } = req.params;

            const query = `
                SELECT 
                    spt.*, sub.subject_name,
                    COUNT(rcs.id) as total_remedial_sessions,
                    SUM(CASE WHEN rcs.status = 'Completed' THEN 1 ELSE 0 END) as completed_sessions,
                    SUM(CASE WHEN rcs.status = 'Missed' THEN 1 ELSE 0 END) as missed_sessions
                FROM student_penalty_tracking spt
                JOIN subjects sub ON spt.subject_id = sub.id
                LEFT JOIN remedial_classwork_sessions rcs ON spt.student_roll = rcs.student_roll 
                    AND spt.subject_id = rcs.subject_id
                WHERE spt.student_roll = ?
                GROUP BY spt.id, spt.student_roll, spt.subject_id, sub.subject_name
                ORDER BY spt.penalty_start_date DESC
            `;

            const [history] = await db.execute(query, [studentRoll]);

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            console.error('Get student penalty history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch student penalty history',
                error: error.message
            });
        }
    }
}

module.exports = PenaltyController;
