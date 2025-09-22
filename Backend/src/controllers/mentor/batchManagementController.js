const db = require('../../config/db');

// Get all batches for a subject in a section (mentor view - read only)
exports.getBatches = async (req, res) => {
    try {
        const { sectionId, subjectId } = req.params;

        const sql = `
                SELECT 
                    sb.*,
                    sbc.max_batches,
                    COUNT(sba.student_roll) as current_students,
                    AVG(COALESCE(sap.performance_score, 0)) as avg_performance
                FROM section_batches sb
                LEFT JOIN subject_batch_config sbc ON sb.subject_id = sbc.subject_id 
                    AND sbc.section_id = sb.section_id
                LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id
                LEFT JOIN student_activity_participation sap ON sba.student_roll = sap.student_roll
                WHERE sb.section_id = ? AND sb.subject_id = ? AND sb.is_active = 1
                GROUP BY sb.id, sb.batch_name, sb.batch_level, sb.max_students, sbc.max_batches
                ORDER BY sb.batch_level
            `;

        db.query(sql, [sectionId, subjectId], (error, batches) => {
            if (error) {
                console.error('Get batches error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batches',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: batches
            });
        });
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch batches',
            error: error.message
        });
    }
}

// Get batch details with students for a specific batch (mentor view - read only)
exports.getBatchDetails = async (req, res) => {
    try {
        const { batch_name, section_id, subject_id } = req.body;

        // First get batch info
        const batchInfoSql = `
            SELECT 
    sb.*,
    COUNT(DISTINCT sba.student_roll) AS total_students,
    AVG(COALESCE(sap.performance_score, 0)) AS avg_performance,
    COUNT(DISTINCT th.id) AS active_topics
FROM section_batches sb
LEFT JOIN student_batch_assignments sba 
    ON sb.id = sba.batch_id 
   AND sb.subject_id = sba.subject_id   -- ensure student count is per batch+subject
LEFT JOIN student_activity_participation sap 
    ON sba.student_roll = sap.student_roll
LEFT JOIN topic_hierarchy th 
    ON th.subject_id = sb.subject_id    -- topics filtered by subject
WHERE sb.batch_name = ? 
  AND sb.section_id = ? 
  AND sb.subject_id = ?
GROUP BY sb.id;


        `;

        db.query(batchInfoSql, [batch_name, section_id, subject_id], (error, batchInfo) => {
            if (error) {
                console.error('Get batch info error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batch info',
                    error: error.message
                });
            }
            console.log(batchInfo);
            
            if (!batchInfo.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Batch not found'
                });
            }

            const batchId = batchInfo[0].id;

            // Get students in the batch
            const studentsSql = `
                SELECT 
                    s.roll as student_roll, 
                    s.name as student_name, 
                    s.profile_photo,
                    sba.assigned_at,
                    COALESCE(stp_summary.completed_topics, 0) as topics_completed,
                    COALESCE(stp_summary.total_topics, 0) as total_topics,
                    COALESCE(stp_summary.avg_score, 0) as current_performance,
                    COALESCE(spt.homework_miss_count, 0) as pending_homework,
                    COALESCE(spt.failed_assessment_count, 0) as penalty_count,
                    sba.assigned_at as last_activity
                FROM student_batch_assignments sba
                JOIN students s ON sba.student_roll = s.roll
                LEFT JOIN (
                    SELECT 
                        student_roll, 
                        COUNT(*) as total_topics,
                        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_topics,
                        AVG(last_assessment_score) as avg_score
                    FROM student_topic_progress stp
                    JOIN topic_hierarchy th ON stp.topic_id = th.id
                    WHERE th.subject_id = ?
                    GROUP BY student_roll
                ) stp_summary ON s.roll = stp_summary.student_roll
                LEFT JOIN student_penalty_tracking spt ON s.roll = spt.student_roll 
                    AND spt.subject_id = ?
                WHERE sba.batch_id = ? AND sba.is_current = 1
                ORDER BY s.name
            `;

            db.query(studentsSql, [subject_id, subject_id, batchId], (error2, students) => {
                if (error2) {
                    console.error('Get batch students error:', error2);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch batch students',
                        error: error2.message
                    });
                }

                res.json({
                    success: true,
                    batch_info: batchInfo[0],
                    students: students
                });
            });
        });
    } catch (error) {
        console.error('Get batch details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch batch details',
            error: error.message
        });
    }
}

// Get batch analytics for mentor view
exports.getBatchAnalytics = async (req, res) => {
    try {
        const { sectionId, subjectId } = req.params;

        const sql = `
                SELECT 
                    sb.id, sb.batch_name, sb.batch_level,
                    COUNT(sba.student_roll) as student_count,
                    AVG(COALESCE(stp.completion_percentage, 0)) as avg_completion,
                    AVG(COALESCE(stp.last_assessment_score, 0)) as avg_assessment_score,
                    0 as students_on_penalty,
                    0 as avg_homework_rate
                FROM section_batches sb
                LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id
                LEFT JOIN student_topic_progress stp ON sba.student_roll = stp.student_roll 
                    AND stp.subject_id = sb.subject_id
                LEFT JOIN student_penalty_tracking spt ON sba.student_roll = spt.student_roll 
                    AND spt.subject_id = sb.subject_id
                WHERE sb.section_id = ? AND sb.subject_id = ? AND sb.is_active = 1
                GROUP BY sb.id, sb.batch_name, sb.batch_level
                ORDER BY sb.batch_level
            `;

        db.query(sql, [sectionId, subjectId], (error, analytics) => {
            if (error) {
                console.error('Get batch analytics error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batch analytics',
                    error: error.message
                });
            }

            // Calculate summary statistics
            const summary = analytics.reduce((acc, batch) => {
                acc.total_students += batch.student_count || 0;
                acc.total_batches += 1;
                acc.total_completion += batch.avg_completion || 0;
                acc.total_assessment += batch.avg_assessment_score || 0;
                return acc;
            }, { 
                total_students: 0, 
                total_batches: 0, 
                total_completion: 0, 
                total_assessment: 0 
            });

            // Calculate averages
            const avgPerformance = analytics.length > 0 
                ? (summary.total_completion + summary.total_assessment) / (2 * analytics.length)
                : 0;

            const analyticsData = {
                total_students: summary.total_students,
                total_batches: summary.total_batches,
                avg_performance: avgPerformance,
                batches: analytics
            };

            res.json({
                success: true,
                data: analyticsData
            });
        });
    } catch (error) {
        console.error('Get batch analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch batch analytics',
            error: error.message
        });
    }
}

// Get sections and subjects for mentor
exports.getSectionSubjects = (req, res) => {
    try {
        const { sectionId } = req.body;

        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }

        const sql = `
            SELECT DISTINCT 
                ssa.subject_id as id, 
                sub.subject_name,
                COUNT(sb.id) as batch_count,
                SUM(CASE WHEN sb.is_active = 1 THEN 1 ELSE 0 END) as active_batches
            FROM section_subject_activities ssa
            JOIN subjects sub ON ssa.subject_id = sub.id
            LEFT JOIN section_batches sb ON ssa.subject_id = sb.subject_id AND ssa.section_id = sb.section_id
            WHERE ssa.section_id = ?
            GROUP BY ssa.subject_id, sub.subject_name
            ORDER BY sub.subject_name
        `;

        db.query(sql, [sectionId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch subjects',
                    error: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: 'Section subjects fetched successfully',
                data: results
            });
        });
    } catch (error) {
        console.error('Get section subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch section subjects',
            error: error.message
        });
    }
};

//Cron Jobs for batch management can be added here in the future
module.exports = exports;
