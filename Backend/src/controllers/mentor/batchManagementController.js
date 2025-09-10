const db = require('../../config/db');

// Get all batches for a subject in a section (mentor view - read only)
exports.getBatches = async (req, res) => {
    try {
        const { sectionId, subjectId } = req.params;

        if (!sectionId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and Subject ID are required'
            });
        }

        const sql = `
            SELECT 
                sb.*,
                sbc.max_batches,
                COUNT(sba.id) as current_students,
                AVG(COALESCE(sap.performance_score, 0)) as avg_performance,
                sec.section_name,
                sec.grade_id,
                s.subject_name
            FROM section_batches sb
            LEFT JOIN subject_batch_config sbc ON sb.subject_id = sbc.subject_id 
                AND sbc.section_id = sb.section_id
            LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id AND sba.is_current = 1
            LEFT JOIN student_activity_participation sap ON sba.student_roll = sap.student_roll
            LEFT JOIN sections sec ON sb.section_id = sec.id
            LEFT JOIN subjects s ON sb.subject_id = s.id
            WHERE sb.section_id = ? AND sb.subject_id = ? AND sb.is_active = 1
            GROUP BY sb.id, sb.batch_name, sb.batch_level, sb.max_students, sbc.max_batches
            ORDER BY sb.batch_level, sb.batch_name
        `;

        db.query(sql, [sectionId, subjectId], (error, batches) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batches',
                    error: error.message
                });
            }

            // Calculate additional analytics
            const processedBatches = batches.map(batch => ({
                ...batch,
                utilization_percentage: batch.max_students > 0 
                    ? Math.round((batch.current_students / batch.max_students) * 100) 
                    : 0,
                avg_performance: Math.round(batch.avg_performance || 0),
                status: batch.current_students === 0 ? 'Empty' : 
                       batch.current_students === batch.max_students ? 'Full' : 'Active'
            }));

            res.status(200).json({
                success: true,
                message: 'Batches fetched successfully',
                data: {
                    batches: processedBatches,
                    section_name: batches.length > 0 ? batches[0].section_name : '',
                    subject_name: batches.length > 0 ? batches[0].subject_name : '',
                    grade_id: batches.length > 0 ? batches[0].grade_id : '',
                    total_batches: batches.length,
                    total_students: batches.reduce((sum, batch) => sum + batch.current_students, 0)
                }
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
};

// Get batch details with students for a specific batch (mentor view - read only)
exports.getBatchDetails = async (req, res) => {
    try {
        const { batch_name, section_id, subject_id } = req.body;

        if (!batch_name || !section_id || !subject_id) {
            return res.status(400).json({
                success: false,
                message: 'Batch name, Section ID, and Subject ID are required'
            });
        }

        // First get batch info
        const batchInfoSql = `
            SELECT 
                sb.*,
                COUNT(sba.id) as total_students,
                AVG(COALESCE(sap.performance_score, 0)) as avg_performance,
                COUNT(DISTINCT th.id) as active_topics,
                sec.section_name,
                sec.grade_id,
                s.subject_name
            FROM section_batches sb
            LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id AND sba.is_current = 1
            LEFT JOIN student_activity_participation sap ON sba.student_roll = sap.student_roll
            LEFT JOIN topic_hierarchy th ON th.subject_id = sb.subject_id AND th.is_active = 1
            LEFT JOIN sections sec ON sb.section_id = sec.id
            LEFT JOIN subjects s ON sb.subject_id = s.id
            WHERE sb.batch_name = ? AND sb.section_id = ? AND sb.subject_id = ?
            GROUP BY sb.id
        `;

        db.query(batchInfoSql, [batch_name, section_id, subject_id], (error, batchInfo) => {
            if (error) {
                console.error('Database error getting batch info:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batch information',
                    error: error.message
                });
            }

            if (batchInfo.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Batch not found'
                });
            }

            // Now get students in this batch
            const studentsInBatchSql = `
                SELECT 
                    st.student_roll,
                    st.student_name,
                    st.student_email,
                    st.phone,
                    sba.assigned_date,
                    sba.performance_at_assignment,
                    AVG(COALESCE(sap.performance_score, 0)) as current_performance,
                    COUNT(stp.id) as completed_topics,
                    sb.batch_name,
                    sb.batch_level
                FROM students st
                JOIN student_batch_assignments sba ON st.student_roll = sba.student_roll
                JOIN section_batches sb ON sba.batch_id = sb.id
                LEFT JOIN student_activity_participation sap ON st.student_roll = sap.student_roll
                LEFT JOIN student_topic_progress stp ON st.student_roll = stp.student_roll 
                    AND stp.completion_status = 'completed'
                WHERE sb.batch_name = ? AND sb.section_id = ? AND sb.subject_id = ? 
                    AND sba.is_current = 1
                GROUP BY st.student_roll, st.student_name, sba.assigned_date, sba.performance_at_assignment
                ORDER BY st.student_name
            `;

            db.query(studentsInBatchSql, [batch_name, section_id, subject_id], (studentsError, students) => {
                if (studentsError) {
                    console.error('Database error getting students:', studentsError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch batch students',
                        error: studentsError.message
                    });
                }

                // Process student data
                const processedStudents = students.map(student => ({
                    ...student,
                    current_performance: Math.round(student.current_performance || 0),
                    performance_change: student.current_performance - (student.performance_at_assignment || 0),
                    assigned_date: new Date(student.assigned_date).toLocaleDateString(),
                    progress_status: student.completed_topics > 0 ? 'Active' : 'Not Started'
                }));

                res.status(200).json({
                    success: true,
                    message: 'Batch details fetched successfully',
                    data: {
                        batch_info: {
                            ...batchInfo[0],
                            avg_performance: Math.round(batchInfo[0].avg_performance || 0),
                            utilization_percentage: batchInfo[0].max_students > 0 
                                ? Math.round((batchInfo[0].total_students / batchInfo[0].max_students) * 100) 
                                : 0
                        },
                        students: processedStudents,
                        analytics: {
                            total_students: students.length,
                            avg_performance: Math.round(
                                students.length > 0 
                                    ? students.reduce((sum, s) => sum + s.current_performance, 0) / students.length 
                                    : 0
                            ),
                            active_students: students.filter(s => s.completed_topics > 0).length,
                            top_performer: students.length > 0 
                                ? students.reduce((max, s) => s.current_performance > max.current_performance ? s : max)
                                : null
                        }
                    }
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
};

// Get batch analytics for mentor view
exports.getBatchAnalytics = async (req, res) => {
    try {
        const { sectionId, subjectId } = req.body;

        if (!sectionId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID and Subject ID are required'
            });
        }

        const analyticsSql = `
            SELECT 
                sb.batch_name,
                sb.batch_level,
                sb.max_students,
                COUNT(sba.id) as current_students,
                AVG(COALESCE(sap.performance_score, 0)) as avg_performance,
                COUNT(DISTINCT stp.student_roll) as active_learners,
                SUM(CASE WHEN stp.completion_status = 'completed' THEN 1 ELSE 0 END) as completed_topics,
                AVG(stp.progress_percentage) as avg_progress
            FROM section_batches sb
            LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id AND sba.is_current = 1
            LEFT JOIN student_activity_participation sap ON sba.student_roll = sap.student_roll
            LEFT JOIN student_topic_progress stp ON sba.student_roll = stp.student_roll
            WHERE sb.section_id = ? AND sb.subject_id = ? AND sb.is_active = 1
            GROUP BY sb.id, sb.batch_name, sb.batch_level, sb.max_students
            ORDER BY sb.batch_level, sb.batch_name
        `;

        db.query(analyticsSql, [sectionId, subjectId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batch analytics',
                    error: error.message
                });
            }

            // Calculate overall statistics
            const totalStudents = results.reduce((sum, batch) => sum + batch.current_students, 0);
            const totalCapacity = results.reduce((sum, batch) => sum + batch.max_students, 0);
            const overallPerformance = results.length > 0 
                ? results.reduce((sum, batch) => sum + (batch.avg_performance || 0), 0) / results.length 
                : 0;

            const processedAnalytics = results.map(batch => ({
                ...batch,
                avg_performance: Math.round(batch.avg_performance || 0),
                avg_progress: Math.round(batch.avg_progress || 0),
                utilization_rate: batch.max_students > 0 
                    ? Math.round((batch.current_students / batch.max_students) * 100) 
                    : 0,
                engagement_rate: batch.current_students > 0 
                    ? Math.round((batch.active_learners / batch.current_students) * 100) 
                    : 0
            }));

            res.status(200).json({
                success: true,
                message: 'Batch analytics fetched successfully',
                data: {
                    batch_analytics: processedAnalytics,
                    overall_stats: {
                        total_batches: results.length,
                        total_students: totalStudents,
                        total_capacity: totalCapacity,
                        overall_utilization: totalCapacity > 0 
                            ? Math.round((totalStudents / totalCapacity) * 100) 
                            : 0,
                        overall_performance: Math.round(overallPerformance),
                        active_batches: results.filter(b => b.current_students > 0).length
                    }
                }
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
};

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

module.exports = exports;
