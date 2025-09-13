const db = require('../../config/db');

// class BatchManagementController {
// Get all batches for a subject in a section
exports.getBatches = async (req, res) => {
    try {
        const { sectionId, subjectId } = req.params;

        const sql = `
                SELECT 
                    sb.*,
                    sbc.max_batches,
                    COUNT(sba.id) as current_students,
                    AVG(COALESCE(sap.performance_score, 0)) as avg_performance
                FROM section_batches sb
                LEFT JOIN subject_batch_config sbc ON sb.subject_id = sbc.subject_id 
                    AND sbc.section_id = sb.section_id
                LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id AND sba.is_current = 1
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

// Get batch details with students for a specific batch
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
                    spt.is_on_penalty,
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

// Configure batch settings for a subject
exports.configureBatches = async (req, res) => {
    try {
        const { subjectId, gradeId, sectionId, maxBatches, batchSizeLimit, autoAllocation, coordinatorId } = req.body;

        // Insert or update batch configuration
        const configSql = `
                INSERT INTO subject_batch_config 
                (subject_id, grade_id, section_id, max_batches, batch_size_limit, auto_allocation, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                max_batches = VALUES(max_batches),
                batch_size_limit = VALUES(batch_size_limit),
                auto_allocation = VALUES(auto_allocation),
                updated_at = CURRENT_TIMESTAMP
            `;

        db.query(configSql, [
            subjectId, gradeId, sectionId, maxBatches, batchSizeLimit, autoAllocation, coordinatorId
        ], (error, result) => {
            if (error) {
                console.error('Configure batches error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to configure batches',
                    error: error.message
                });
            }

            // Create batches if needed
            createBatchesIfNeeded(sectionId, subjectId, maxBatches, (createError) => {
                if (createError) {
                    console.error('Create batches error:', createError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create batches',
                        error: createError.message
                    });
                }

                res.json({
                    success: true,
                    message: 'Batch configuration updated successfully'
                });
            });
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
const createBatchesIfNeeded = (sectionId, subjectId, maxBatches, callback) => {
    try {
        // Check existing batches
        const checkSql = 'SELECT COUNT(*) as count FROM section_batches WHERE section_id = ? AND subject_id = ? AND is_active = 1';
        
        db.query(checkSql, [sectionId, subjectId], (error, result) => {
            if (error) {
                return callback(error);
            }

            const existingCount = result[0].count;

            if (existingCount < maxBatches) {
                const batchNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                let batchesCreated = 0;

                for (let i = existingCount; i < maxBatches; i++) {
                    const insertSql = `
                            INSERT INTO section_batches 
                            (section_id, subject_id, batch_name, batch_level, auto_created)
                            VALUES (?, ?, ?, ?, 1)
                        `;

                    db.query(insertSql, [
                        sectionId, subjectId, `Batch ${batchNames[i]}`, i + 1
                    ], (insertError, insertResult) => {
                        if (insertError) {
                            return callback(insertError);
                        }

                        batchesCreated++;
                        if (batchesCreated === maxBatches - existingCount) {
                            callback(null);
                        }
                    });
                }
            } else {
                callback(null);
            }
        });
    } catch (error) {
        callback(error);
    }
}

// Get students in a specific batch
exports.getBatchStudents = async (req, res) => {
    try {
        const { batchId } = req.params;

        const sql = `
                SELECT 
                    s.roll, s.name, s.profile_photo,
                    sba.assigned_at,
                    sb.batch_name, sb.batch_level,
                    COALESCE(stp_summary.completed_topics, 0) as completed_topics,
                    COALESCE(stp_summary.total_topics, 0) as total_topics,
                    COALESCE(stp_summary.avg_score, 0) as avg_assessment_score,
                    0 as homework_completion_rate,
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

        db.query(sql, [batchId, batchId], (error, students) => {
            if (error) {
                console.error('Get batch students error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batch students',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: students
            });
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
exports.moveStudentToBatch = async (req, res) => {
    try {
        const { studentRoll, fromBatchId, toBatchId, reason, notes, coordinatorId, subjectId } = req.body;
        console.log("Request Body:", req.body);
        
        // Get subject ID
        const batchInfoSql = 'SELECT subject_id FROM section_batches WHERE id = ?';
        
        db.query(batchInfoSql, [toBatchId], (error1, batchInfo) => {
            if (error1) {
                console.error('Error getting batch info:', error1);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batch info',
                    error: error1.message
                });
            }

            if (!batchInfo.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Target batch not found'
                });
            }

            // const subjectId = batchInfo[0].subject_id;

            // Start transaction
            db.query('START TRANSACTION', [], (transError) => {
                if (transError) {
                    console.error('Transaction start error:', transError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to start transaction',
                        error: transError.message
                    });
                }

                // Update current assignment
                const updateSql = 'DELETE FROM student_batch_assignments WHERE student_roll = ? AND batch_id = ? AND is_current = 1';

                db.query(updateSql, [studentRoll, fromBatchId], (error2) => {
                    if (error2) {
                        console.error('Error updating current assignment:', error2);
                        db.query('ROLLBACK', [], () => {});
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to update current assignment',
                            error: error2.message
                        });
                    }

                    // Create new assignment
                    const insertSql = 'INSERT INTO student_batch_assignments (student_roll, subject_id, batch_id, assigned_by, is_current) VALUES (?, ?, ?, ?, 1)';

                    db.query(insertSql, [studentRoll, subjectId,toBatchId, coordinatorId], (error3) => {
                        if (error3) {
                            console.error('Error creating new assignment:', error3);
                            db.query('ROLLBACK', [], () => {});
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to create new assignment',
                                error: error3.message
                            });
                        }

                        // Record in history
                        const historySql = `
                            INSERT INTO student_batch_history 
                            (student_roll, subject_id, from_batch_id, to_batch_id, allocation_reason, 
                             allocation_date, allocated_by, notes, effective_from)
                            VALUES (?, ?, ?, ?, 'Manual', CURDATE(), 'Coordinator', ?, CURDATE())
                        `;
                        
                        db.query(historySql, [studentRoll, subjectId, fromBatchId, toBatchId, notes], (error4) => {
                            if (error4) {
                                console.error('Error recording in history:', error4);
                                db.query('ROLLBACK', [], () => {});
                                return res.status(500).json({
                                    success: false,
                                    message: 'Failed to record in history',
                                    error: error4.message
                                });
                            }

                            // Commit transaction
                            db.query('COMMIT', [], (commitError) => {
                                if (commitError) {
                                    console.error('Transaction commit error:', commitError);
                                    db.query('ROLLBACK', [], () => {});
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Failed to commit transaction',
                                        error: commitError.message
                                    });
                                }

                                res.json({
                                    success: true,
                                    message: 'Student moved to new batch successfully'
                                });
                            });
                        });
                    });
                });
            });
        });
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
exports.getBatchHistory = async (req, res) => {
    try {
        const { studentRoll, subjectId } = req.params;

        const sql = `
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

        db.query(sql, [studentRoll, subjectId], (error, history) => {
            if (error) {
                console.error('Get batch history error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch batch history',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: history
            });
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
exports.runBatchReallocation = async (req, res) => {
    try {
        const { sectionId, subjectId } = req.body;
        
        // Simple reallocation logic: Move students based on their performance
        // Get all students with their current performance
        const getStudentsSQL = `
            SELECT 
                sba.student_roll,
                sba.batch_id as current_batch_id,
                sb.batch_level as current_level,
                sba.assigned_by,
                COALESCE(AVG(stp.last_assessment_score), 0) as avg_score,
                COUNT(CASE WHEN stp.status = 'Completed' THEN 1 END) as completed_topics
            FROM student_batch_assignments sba
            JOIN section_batches sb ON sba.batch_id = sb.id
            LEFT JOIN student_topic_progress stp ON sba.student_roll = stp.student_roll 
                AND stp.subject_id = sb.subject_id
            WHERE sb.section_id = ? AND sb.subject_id = ? AND sba.is_current = 1
            GROUP BY sba.student_roll, sba.batch_id, sb.batch_level, sba.assigned_by
        `;

        db.query(getStudentsSQL, [sectionId, subjectId], (error1, students) => {
            if (error1) {
                console.error('Error getting students for reallocation:', error1);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch students for reallocation',
                    error: error1.message
                });
            }

            // Get available batches
            const getBatchesSQL = `
                SELECT id, batch_level, batch_name, max_students
                FROM section_batches 
                WHERE section_id = ? AND subject_id = ? AND is_active = 1
                ORDER BY batch_level
            `;

            db.query(getBatchesSQL, [sectionId, subjectId], (error2, batches) => {
                if (error2) {
                    console.error('Error getting batches for reallocation:', error2);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch batches for reallocation',
                        error: error2.message
                    });
                }

                if (batches.length === 0) {
                    return res.json({
                        success: true,
                        message: 'No batches found for reallocation'
                    });
                }

                // Simple algorithm: Assign students to batches based on performance
                // High performers go to higher level batches, low performers to lower level batches
                students.sort((a, b) => (b.avg_score + b.completed_topics) - (a.avg_score + a.completed_topics));
                
                let reallocations = [];
                const studentsPerBatch = Math.ceil(students.length / batches.length);
                
                students.forEach((student, index) => {
                    const targetBatchIndex = Math.min(Math.floor(index / studentsPerBatch), batches.length - 1);
                    const targetBatch = batches[targetBatchIndex];
                    
                    if (student.current_batch_id !== targetBatch.id) {
                        reallocations.push({
                            studentRoll: student.student_roll,
                            fromBatchId: student.current_batch_id,
                            toBatchId: targetBatch.id,
                            coordinatorId: student.assigned_by,
                            reason: 'Performance-based reallocation'
                        });
                    }
                });

                if (reallocations.length === 0) {
                    return res.json({
                        success: true,
                        message: 'No reallocations needed - students are already optimally placed'
                    });
                }

                // Process reallocations
                let processedCount = 0;
                let hasError = false;

                const processReallocation = (index) => {
                    if (index >= reallocations.length) {
                        if (!hasError) {
                            res.json({
                                success: true,
                                message: `Batch reallocation completed successfully. ${processedCount} students moved.`
                            });
                        }
                        return;
                    }

                    const reallocation = reallocations[index];
                    
                    // Update current assignment
                    const updateCurrentSQL = 'UPDATE student_batch_assignments SET is_current = 0 WHERE student_roll = ? AND batch_id = ? AND is_current = 1';
                    
                    db.query(updateCurrentSQL, [reallocation.studentRoll, reallocation.fromBatchId], (error3) => {
                        if (error3 && !hasError) {
                            hasError = true;
                            console.error('Error updating current assignment:', error3);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to update student assignments',
                                error: error3.message
                            });
                        }

                        if (!hasError) {
                            // Create new assignment
                            const insertNewSQL = 'INSERT INTO student_batch_assignments (student_roll, subject_id, batch_id, assigned_by, is_current) VALUES (?, ?, ?, ?, 1)';
                            
                            db.query(insertNewSQL, [reallocation.studentRoll, subjectId, reallocation.toBatchId, reallocation.coordinatorId], (error4) => {
                                if (error4 && !hasError) {
                                    hasError = true;
                                    console.error('Error creating new assignment:', error4);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Failed to create new assignments',
                                        error: error4.message
                                    });
                                }

                                if (!hasError) {
                                    processedCount++;
                                    processReallocation(index + 1);
                                }
                            });
                        }
                    });
                };

                processReallocation(0);
            });
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
exports.getBatchAnalytics = async (req, res) => {
    try {
        const { sectionId, subjectId } = req.params;

        const sql = `
                SELECT 
                    sb.id, sb.batch_name, sb.batch_level,
                    COUNT(sba.student_roll) as student_count,
                    AVG(COALESCE(stp.completion_percentage, 0)) as avg_completion,
                    AVG(COALESCE(stp.last_assessment_score, 0)) as avg_assessment_score,
                    SUM(CASE WHEN spt.is_on_penalty = 1 THEN 1 ELSE 0 END) as students_on_penalty,
                    0 as avg_homework_rate
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

// Initialize students to first batch (for new subjects)
exports.initializeStudentBatches = async (req, res) => {
    try {
        const { sectionId, subjectId, section_id, subject_id, coordinatorId } = req.body;
        // Handle both naming conventions
        const finalSectionId = sectionId || section_id;
        const finalSubjectId = subjectId || subject_id;

        // Get first batch ID
        const firstBatchSql = 'SELECT id FROM section_batches WHERE section_id = ? AND subject_id = ? AND batch_level = 1 AND is_active = 1 LIMIT 1';
        
        db.query(firstBatchSql, [finalSectionId, finalSubjectId], (error1, firstBatch) => {
            if (error1) {
                console.error('Error getting first batch:', error1);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch first batch',
                    error: error1.message
                });
            }

            if (!firstBatch.length) {
                return res.status(404).json({
                    success: false,
                    message: 'First batch not found. Please configure batches first.'
                });
            }

            const firstBatchId = firstBatch[0].id;

            // Get all students in section who are not yet assigned to any batch for this subject
            const unassignedSql = `
                SELECT s.roll 
                FROM students s 
                WHERE s.section_id = ?
                AND s.roll NOT IN (
                    SELECT DISTINCT sba.student_roll 
                    FROM student_batch_assignments sba 
                    JOIN section_batches sb ON sba.batch_id = sb.id 
                    WHERE sb.subject_id = ? AND sba.is_current = 1
                )
            `;

            db.query(unassignedSql, [finalSectionId, finalSubjectId], (error2, unassignedStudents) => {
                if (error2) {
                    console.error('Error getting unassigned students:', error2);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch unassigned students',
                        error: error2.message
                    });
                }

                if (unassignedStudents.length === 0) {
                    return res.json({
                        success: true,
                        message: 'No unassigned students found'
                    });
                }

                // Process each student assignment
                let processedCount = 0;
                let hasError = false;

                const processStudent = (index) => {
                    if (index >= unassignedStudents.length) {
                        if (!hasError) {
                            res.json({
                                success: true,
                                message: `${processedCount} students assigned to first batch successfully`
                            });
                        }
                        return;
                    }

                    const student = unassignedStudents[index];
                    const assignSql = 'INSERT INTO student_batch_assignments (student_roll, subject_id, batch_id, assigned_by, is_current) VALUES (?, ?, ?, ?, 1)';
                    
                    db.query(assignSql, [student.roll, subjectId, firstBatchId, coordinatorId], (error3) => {
                        if (error3 && !hasError) {
                            hasError = true;
                            console.error('Error assigning student to batch:', error3);
                            return res.status(500).json({
                                success: false,
                                message: 'Failed to assign student to batch',
                                error: error3.message
                            });
                        }

                        if (!hasError) {
                            // Record in history
                            const historySql = `
                                INSERT INTO student_batch_history 
                                (student_roll, subject_id, to_batch_id, allocation_reason, allocation_date, allocated_by, effective_from)
                                VALUES (?, ?, ?, 'Initial', CURDATE(), 'Coordinator', CURDATE())
                            `;
                            
                            db.query(historySql, [student.roll, finalSubjectId, firstBatchId], (error4) => {
                                if (error4) {
                                    console.error('Error recording history:', error4);
                                    // Continue even if history fails
                                }
                                
                                processedCount++;
                                processStudent(index + 1);
                            });
                        }
                    });
                };

                processStudent(0);
            });
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

// Update batch size
exports.updateBatchSize = (req, res) => {
    try {
        const { batchId, newMaxStudents, coordinatorId } = req.body;

        if (!batchId || !newMaxStudents || !coordinatorId) {
            return res.status(400).json({
                success: false,
                message: 'Batch ID, new max students, and coordinator ID are required'
            });
        }

        // Validate the new batch size
        const maxStudents = parseInt(newMaxStudents);
        if (isNaN(maxStudents) || maxStudents < 5 || maxStudents > 50) {
            return res.status(400).json({
                success: false,
                message: 'Batch size must be between 5 and 50 students'
            });
        }

        // First check if the batch exists and get current student count
        const checkBatchSql = `
            SELECT 
                sb.id,
                sb.batch_name,
                sb.max_students as current_max,
                COUNT(sba.id) as current_students
            FROM section_batches sb
            LEFT JOIN student_batch_assignments sba ON sb.id = sba.batch_id AND sba.is_current = 1
            WHERE sb.id = ?
            GROUP BY sb.id, sb.batch_name, sb.max_students
        `;

        db.query(checkBatchSql, [batchId], (error, batchResults) => {
            if (error) {
                console.error('Check batch error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check batch details',
                    error: error.message
                });
            }

            if (batchResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Batch not found'
                });
            }

            const batch = batchResults[0];

            // Check if new size is smaller than current students
            if (maxStudents < batch.current_students) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot set batch size to ${maxStudents}. Current batch has ${batch.current_students} students.`
                });
            }

            // Update the batch size
            const updateSql = `
                UPDATE section_batches 
                SET max_students = ?, 
                    updated_at = NOW(),
                    updated_by = ?
                WHERE id = ?
            `;

            db.query(updateSql, [maxStudents, coordinatorId, batchId], (updateError, updateResult) => {
                if (updateError) {
                    console.error('Update batch size error:', updateError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update batch size',
                        error: updateError.message
                    });
                }

                if (updateResult.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Batch not found or no changes made'
                    });
                }

                // Log the change for audit purposes
                const logSql = `
                    INSERT INTO batch_change_log (batch_id, coordinator_id, change_type, old_value, new_value, created_at)
                    VALUES (?, ?, 'max_students_update', ?, ?, NOW())
                `;

                db.query(logSql, [batchId, coordinatorId, batch.current_max, maxStudents], (logError) => {
                    // Don't fail the operation if logging fails, just log the error
                    if (logError) {
                        console.error('Audit log error:', logError);
                    }
                });

                res.json({
                    success: true,
                    message: `Batch size updated successfully from ${batch.current_max} to ${maxStudents} students`,
                    data: {
                        batchId: batchId,
                        batchName: batch.batch_name,
                        oldMaxStudents: batch.current_max,
                        newMaxStudents: maxStudents,
                        currentStudents: batch.current_students
                    }
                });
            });
        });
    } catch (error) {
        console.error('Update batch size error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update batch size',
            error: error.message
        });
    }
};

exports.getSectionSubjects = (req, res) => {

  const { sectionId } = req.body;

  const sql = `
    SELECT DISTINCT ssa.subject_id as id, sub.subject_name
    FROM section_subject_activities ssa
    JOIN Subjects sub ON ssa.subject_id = sub.id
    WHERE section_id = ?;
  `;
  db.query(sql, [sectionId], (err, results) => {
    if (err) {
      console.error("Error fetching subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subjects data fetched successfully", sectionSubjects: results });
  });
};
//}

// module.exports = BatchManagementController;
