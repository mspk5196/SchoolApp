const db = require('../../config/db');

class BatchManagementController {
    // Get all batches for a subject in a section
    static async getBatches(req, res) {
        try {
            const { sectionId, subjectId } = req.params;
            
            const query = `
                SELECT 
                    sb.*,
                    sbc.max_batches,
                    COUNT(sba.id) as current_students,
                    AVG(
                        (COALESCE(sap.performance_score, 0) * 0.4) +
                        (COALESCE(homework_completion_rate(sba.student_roll, sb.subject_id), 0) * 0.3) +
                        (COALESCE(assessment_average(sba.student_roll, sb.subject_id), 0) * 0.3)
                    ) as avg_performance
                FROM section_batches sb
                LEFT JOIN subject_batch_config sbc ON sb.subject_id = sbc.subject_id 
                    AND sbc.section_id = sb.section_id
                LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id AND sba.is_current = 1
                LEFT JOIN student_activity_participation sap ON sba.student_roll = sap.student_roll
                WHERE sb.section_id = ? AND sb.subject_id = ? AND sb.is_active = 1
                GROUP BY sb.id, sb.batch_name, sb.batch_level, sb.max_students, sbc.max_batches
                ORDER BY sb.batch_level
            `;
            
            const [batches] = await db.execute(query, [sectionId, subjectId]);
            
            res.json({
                success: true,
                data: batches
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

    // Configure batch settings for a subject
    static async configureBatches(req, res) {
        try {
            const { subjectId, gradeId, sectionId, maxBatches, batchSizeLimit, autoAllocation } = req.body;
            const coordinatorId = req.user.id;
            
            // Insert or update batch configuration
            const configQuery = `
                INSERT INTO subject_batch_config 
                (subject_id, grade_id, section_id, max_batches, batch_size_limit, auto_allocation, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                max_batches = VALUES(max_batches),
                batch_size_limit = VALUES(batch_size_limit),
                auto_allocation = VALUES(auto_allocation),
                updated_at = CURRENT_TIMESTAMP
            `;
            
            await db.execute(configQuery, [
                subjectId, gradeId, sectionId, maxBatches, batchSizeLimit, autoAllocation, coordinatorId
            ]);

            // Create batches if they don't exist
            await this.createBatchesIfNeeded(sectionId, subjectId, maxBatches);

            res.json({
                success: true,
                message: 'Batch configuration updated successfully'
            });
        } catch (error) {
            console.error('Configure batches error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to configure batches',
                error: error.message
            });
        }
    }

    // Create batches automatically
    static async createBatchesIfNeeded(sectionId, subjectId, maxBatches) {
        try {
            // Check existing batches
            const [existing] = await db.execute(
                'SELECT COUNT(*) as count FROM section_batches WHERE section_id = ? AND subject_id = ? AND is_active = 1',
                [sectionId, subjectId]
            );

            const existingCount = existing[0].count;
            
            if (existingCount < maxBatches) {
                const batchNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                
                for (let i = existingCount; i < maxBatches; i++) {
                    const insertQuery = `
                        INSERT INTO section_batches 
                        (section_id, subject_id, batch_name, batch_level, auto_created)
                        VALUES (?, ?, ?, ?, 1)
                    `;
                    
                    await db.execute(insertQuery, [
                        sectionId, subjectId, `Batch ${batchNames[i]}`, i + 1
                    ]);
                }
            }
        } catch (error) {
            console.error('Create batches error:', error);
        }
    }

    // Get students in a specific batch
    static async getBatchStudents(req, res) {
        try {
            const { batchId } = req.params;
            
            const query = `
                SELECT 
                    s.roll, s.name, s.profile_photo,
                    sba.assigned_at,
                    sb.batch_name, sb.batch_level,
                    COALESCE(stp_summary.completed_topics, 0) as completed_topics,
                    COALESCE(stp_summary.total_topics, 0) as total_topics,
                    COALESCE(stp_summary.avg_score, 0) as avg_assessment_score,
                    COALESCE(homework_completion_rate(s.roll, sb.subject_id), 0) as homework_completion_rate,
                    spt.is_on_penalty, spt.homework_miss_count, spt.failed_assessment_count
                FROM student_batch_assignments sba
                JOIN students s ON sba.student_roll = s.roll
                JOIN section_batches sb ON sba.batch_id = sb.id
                LEFT JOIN (
                    SELECT 
                        student_roll, 
                        COUNT(*) as total_topics,
                        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_topics,
                        AVG(last_assessment_score) as avg_score
                    FROM student_topic_progress stp
                    JOIN topic_hierarchy th ON stp.topic_id = th.id
                    WHERE th.subject_id = (SELECT subject_id FROM section_batches WHERE id = ?)
                    GROUP BY student_roll
                ) stp_summary ON s.roll = stp_summary.student_roll
                LEFT JOIN student_penalty_tracking spt ON s.roll = spt.student_roll 
                    AND spt.subject_id = sb.subject_id
                WHERE sba.batch_id = ? AND sba.is_current = 1
                ORDER BY s.name
            `;
            
            const [students] = await db.execute(query, [batchId, batchId]);
            
            res.json({
                success: true,
                data: students
            });
        } catch (error) {
            console.error('Get batch students error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch batch students',
                error: error.message
            });
        }
    }

    // Move student to different batch manually
    static async moveStudentToBatch(req, res) {
        try {
            const { studentRoll, fromBatchId, toBatchId, reason, notes } = req.body;
            const coordinatorId = req.user.id;
            
            // Get subject ID
            const [batchInfo] = await db.execute(
                'SELECT subject_id FROM section_batches WHERE id = ?',
                [toBatchId]
            );
            
            if (!batchInfo.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Target batch not found'
                });
            }
            
            const subjectId = batchInfo[0].subject_id;
            
            // Start transaction
            await db.execute('START TRANSACTION');
            
            try {
                // Update current assignment
                await db.execute(
                    'UPDATE student_batch_assignments SET is_current = 0 WHERE student_roll = ? AND batch_id = ? AND is_current = 1',
                    [studentRoll, fromBatchId]
                );
                
                // Create new assignment
                await db.execute(
                    'INSERT INTO student_batch_assignments (student_roll, batch_id, assigned_by, is_current) VALUES (?, ?, ?, 1)',
                    [studentRoll, toBatchId, coordinatorId]
                );
                
                // Record in history
                await db.execute(`
                    INSERT INTO student_batch_history 
                    (student_roll, subject_id, from_batch_id, to_batch_id, allocation_reason, 
                     allocation_date, allocated_by, notes, effective_from)
                    VALUES (?, ?, ?, ?, 'Manual', CURDATE(), 'Coordinator', ?, CURDATE())
                `, [studentRoll, subjectId, fromBatchId, toBatchId, notes]);
                
                await db.execute('COMMIT');
                
                res.json({
                    success: true,
                    message: 'Student moved to new batch successfully'
                });
            } catch (error) {
                await db.execute('ROLLBACK');
                throw error;
            }
        } catch (error) {
            console.error('Move student to batch error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to move student',
                error: error.message
            });
        }
    }

    // Get batch allocation history
    static async getBatchHistory(req, res) {
        try {
            const { studentRoll, subjectId } = req.params;
            
            const query = `
                SELECT 
                    sbh.*,
                    sb_from.batch_name as from_batch_name,
                    sb_to.batch_name as to_batch_name,
                    sb_to.batch_level as to_batch_level
                FROM student_batch_history sbh
                LEFT JOIN section_batches sb_from ON sbh.from_batch_id = sb_from.id
                JOIN section_batches sb_to ON sbh.to_batch_id = sb_to.id
                WHERE sbh.student_roll = ? AND sbh.subject_id = ?
                ORDER BY sbh.allocation_date DESC, sbh.id DESC
            `;
            
            const [history] = await db.execute(query, [studentRoll, subjectId]);
            
            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            console.error('Get batch history error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch batch history',
                error: error.message
            });
        }
    }

    // Run batch reallocation manually
    static async runBatchReallocation(req, res) {
        try {
            await db.execute('CALL reallocate_student_batches()');
            
            res.json({
                success: true,
                message: 'Batch reallocation completed successfully'
            });
        } catch (error) {
            console.error('Run batch reallocation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to run batch reallocation',
                error: error.message
            });
        }
    }

    // Get batch performance analytics
    static async getBatchAnalytics(req, res) {
        try {
            const { sectionId, subjectId } = req.params;
            
            const query = `
                SELECT 
                    sb.id, sb.batch_name, sb.batch_level,
                    COUNT(sba.student_roll) as student_count,
                    AVG(COALESCE(stp.completion_percentage, 0)) as avg_completion,
                    AVG(COALESCE(stp.last_assessment_score, 0)) as avg_assessment_score,
                    SUM(CASE WHEN spt.is_on_penalty = 1 THEN 1 ELSE 0 END) as students_on_penalty,
                    AVG(COALESCE(homework_completion_rate(sba.student_roll, sb.subject_id), 0)) as avg_homework_rate
                FROM section_batches sb
                LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id AND sba.is_current = 1
                LEFT JOIN student_topic_progress stp ON sba.student_roll = stp.student_roll 
                    AND stp.subject_id = sb.subject_id
                LEFT JOIN student_penalty_tracking spt ON sba.student_roll = spt.student_roll 
                    AND spt.subject_id = sb.subject_id
                WHERE sb.section_id = ? AND sb.subject_id = ? AND sb.is_active = 1
                GROUP BY sb.id, sb.batch_name, sb.batch_level
                ORDER BY sb.batch_level
            `;
            
            const [analytics] = await db.execute(query, [sectionId, subjectId]);
            
            res.json({
                success: true,
                data: analytics
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

    // Initialize students to first batch (for new subjects)
    static async initializeStudentBatches(req, res) {
        try {
            const { sectionId, subjectId } = req.body;
            const coordinatorId = req.user.id;
            
            // Get first batch ID
            const [firstBatch] = await db.execute(
                'SELECT id FROM section_batches WHERE section_id = ? AND subject_id = ? AND batch_level = 1 AND is_active = 1 LIMIT 1',
                [sectionId, subjectId]
            );
            
            if (!firstBatch.length) {
                return res.status(404).json({
                    success: false,
                    message: 'First batch not found. Please configure batches first.'
                });
            }
            
            const firstBatchId = firstBatch[0].id;
            
            // Get all students in section who are not yet assigned to any batch for this subject
            const [unassignedStudents] = await db.execute(`
                SELECT s.roll 
                FROM students s 
                WHERE s.section_id = ?
                AND s.roll NOT IN (
                    SELECT DISTINCT sba.student_roll 
                    FROM student_batch_assignments sba 
                    JOIN section_batches sb ON sba.batch_id = sb.id 
                    WHERE sb.subject_id = ? AND sba.is_current = 1
                )
            `, [sectionId, subjectId]);
            
            // Assign all unassigned students to first batch
            for (const student of unassignedStudents) {
                await db.execute(
                    'INSERT INTO student_batch_assignments (student_roll, batch_id, assigned_by, is_current) VALUES (?, ?, ?, 1)',
                    [student.roll, firstBatchId, coordinatorId]
                );
                
                // Record in history
                await db.execute(`
                    INSERT INTO student_batch_history 
                    (student_roll, subject_id, to_batch_id, allocation_reason, allocation_date, allocated_by, effective_from)
                    VALUES (?, ?, ?, 'Initial', CURDATE(), 'Coordinator', CURDATE())
                `, [student.roll, subjectId, firstBatchId]);
            }
            
            res.json({
                success: true,
                message: `${unassignedStudents.length} students assigned to first batch successfully`
            });
        } catch (error) {
            console.error('Initialize student batches error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to initialize student batches',
                error: error.message
            });
        }
    }
}

module.exports = BatchManagementController;
