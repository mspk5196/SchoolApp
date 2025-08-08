const db = require('../../config/db');

// class TopicHierarchyController {
// Get complete topic hierarchy for a subject
exports.getTopicHierarchy = async (req, res) => {
    try {
        const { subjectId, gradeId } = req.params;

        // Use simple query instead of recursive CTE for TiDB compatibility
        const sql = `
                SELECT 
                    id, subject_id, parent_id, level, topic_name, topic_code, 
                    order_sequence, has_assessment, has_homework, is_bottom_level,
                    expected_completion_days, pass_percentage, created_at, updated_at
                FROM topic_hierarchy 
                WHERE subject_id = ?
                ORDER BY level, order_sequence
            `;

        console.log('Executing hierarchy query for subjectId:', subjectId, 'gradeId:', gradeId);

        // const result = await db.query(query, [subjectId]);

        db.query(sql, [subjectId], (err, result) => {
            if (err) return res.status(500).json({ success: false });
            if (result.length === 0) return res.status(404).json({ success: false });

            console.log('Hierarchy query result:', result);

            let hierarchy;
            if (Array.isArray(result) && result.length > 0) {
                hierarchy = result;
            } else {
                hierarchy = [];
            }

            console.log('Processed hierarchy data:', hierarchy);

            // Build nested structure
            const buildTree = (items, parentId = null) => {
                if (!Array.isArray(items)) {
                    return [];
                }
                return items
                    .filter(item => item.parent_id === parentId)
                    .map(item => ({
                        ...item,
                        children: buildTree(items, item.id)
                    }));
            };

            const tree = buildTree(hierarchy);

            console.log('Built tree structure:', tree);
            res.json({
                success: true, data: {
                    overallData: result,
                    hierarchy: tree,
                    total_topics: hierarchy.length
                }
            });
        });
    } catch (error) {
        console.error('Get topic hierarchy error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch topic hierarchy',
            error: error.message
        });
    }
}

// Create new topic in hierarchy
exports.createTopic = async (req, res) => {
    try {
        const {
            subjectId, parentId, level, topicName, topicCode, orderSequence,
            hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
        } = req.body;

        const sql = `
                INSERT INTO topic_hierarchy 
                (subject_id, parent_id, level, topic_name, topic_code, order_sequence,
                 has_assessment, has_homework, is_bottom_level, expected_completion_days, pass_percentage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

        // console.log('Executing query:', sql);
        console.log('With parameters:', [
            subjectId, parentId, level, topicName, topicCode, orderSequence,
            hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
        ]);

        db.query(sql, [
            subjectId, parentId, level, topicName, topicCode, orderSequence,
            hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
        ], (error, result) => {
            if (error) {
                console.error('Insert topic error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create topic',
                    error: error.message
                });
            }
            if (result.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Failed to create topic',
                    error: 'No rows affected'
                });
            }
            
            let topicId;
            if (Array.isArray(result) && result[0]) {
                topicId = result[0].insertId || 'created_successfully';
            } else if (result && result.insertId) {
                topicId = result.insertId;
            } else {
                topicId = 'created_successfully';
            }

            res.json({
                success: true,
                message: 'Topic created successfully',
                data: { topicId: topicId }
            });
        });
    } catch (error) {
        console.error('Create topic error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to create topic',
            error: error.message
        });
    }
}

// Get topic materials
exports.getTopicMaterials = async (req, res) => {
    try {
        const { topicId } = req.params;

        const sql = `
                SELECT tm.*, th.topic_name
                FROM topic_materials tm
                JOIN topic_hierarchy th ON tm.topic_id = th.id
                WHERE tm.topic_id = ? AND tm.is_active = 1
                ORDER BY tm.material_type, tm.created_at
            `;

        db.query(sql, [topicId], (error, materials) => {
            if (error) {
                console.error('Get topic materials error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch topic materials',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: materials
            });
        });
    } catch (error) {
        console.error('Get topic materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch topic materials',
            error: error.message
        });
    }
}

// Add material to topic
exports.addTopicMaterial = async (req, res) => {
    try {
        const {
            topicId, materialType, activityName, fileName, fileUrl,
            fileType, estimatedDuration, difficultyLevel, instructions
        } = req.body;

        const sql = `
                INSERT INTO topic_materials 
                (topic_id, material_type, activity_name, file_name, file_url, 
                 file_type, estimated_duration, difficulty_level, instructions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

        db.query(sql, [
            topicId, materialType, activityName, fileName, fileUrl,
            fileType, estimatedDuration, difficultyLevel, instructions
        ], (error, result) => {
            if (error) {
                console.error('Add topic material error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to add material',
                    error: error.message
                });
            }

            let materialId;
            if (result && result.insertId) {
                materialId = result.insertId;
            } else {
                materialId = 'created_successfully';
            }

            res.json({
                success: true,
                message: 'Material added successfully',
                data: { materialId: materialId }
            });
        });
    } catch (error) {
        console.error('Add topic material error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add material',
            error: error.message
        });
    }
}

// Get student progress for all topics in a subject
exports.getStudentProgress = async (req, res) => {
    try {
        const { studentRoll, subjectId } = req.params;

        const sql = `
                SELECT 
                    th.id, th.topic_name, th.topic_code, th.level, th.parent_id,
                    stp.status, stp.completion_percentage, stp.last_assessment_score,
                    stp.completed_at, stp.attempts_count,
                    stch.days_late, stch.completion_status as timing_status
                FROM topic_hierarchy th
                LEFT JOIN student_topic_progress stp ON th.id = stp.topic_id AND stp.student_roll = ?
                LEFT JOIN student_topic_completion_history stch ON th.id = stch.topic_id AND stch.student_roll = ?
                WHERE th.subject_id = ?
                ORDER BY th.level, th.order_sequence
            `;

        db.query(sql, [studentRoll, studentRoll, subjectId], (error, progress) => {
            if (error) {
                console.error('Get student progress error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch student progress',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: progress
            });
        });
    } catch (error) {
        console.error('Get student progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student progress',
            error: error.message
        });
    }
}

// Update student topic progress
exports.updateStudentProgress = async (req, res) => {
    try {
        const { studentRoll, topicId, status, completionPercentage, assessmentScore } = req.body;

        const sql = `
                INSERT INTO student_topic_progress 
                (student_roll, topic_id, subject_id, status, completion_percentage, last_assessment_score, completed_at)
                VALUES (?, ?, (SELECT subject_id FROM topic_hierarchy WHERE id = ?), ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                completion_percentage = VALUES(completion_percentage),
                last_assessment_score = VALUES(last_assessment_score),
                completed_at = VALUES(completed_at),
                attempts_count = attempts_count + 1
            `;

        const completedAt = status === 'Completed' ? new Date() : null;

        db.query(sql, [
            studentRoll, topicId, topicId, status, completionPercentage, assessmentScore, completedAt
        ], (error, result) => {
            if (error) {
                console.error('Update student progress error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update progress',
                    error: error.message
                });
            }

            // If completed, record in history
            if (status === 'Completed') {
                exports.recordCompletionHistory(studentRoll, topicId);
            }

            res.json({
                success: true,
                message: 'Student progress updated successfully'
            });
        });
    } catch (error) {
        console.error('Update student progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update progress',
            error: error.message
        });
    }
}

// Record completion history with timing analysis
exports.recordCompletionHistory = (studentRoll, topicId) => {
    const sql = `
                INSERT INTO student_topic_completion_history
                (student_roll, topic_id, subject_id, level_type, started_date, expected_completion_date,
                 actual_completion_date, days_taken, days_late, completion_status, final_score,
                 batch_at_start, batch_at_completion)
                SELECT 
                    ?, th.id, th.subject_id,
                    CASE 
                        WHEN th.level = 1 THEN 'Level'
                        WHEN th.parent_id IS NULL THEN 'Topic'
                        WHEN th.is_bottom_level = 1 THEN 'Sub_Sub_Topic'
                        ELSE 'Sub_Topic'
                    END,
                    DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY),
                    CURDATE(),
                    CURDATE(),
                    th.expected_completion_days,
                    GREATEST(0, DATEDIFF(CURDATE(), DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY)) - th.expected_completion_days),
                    CASE 
                        WHEN DATEDIFF(CURDATE(), DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY)) <= th.expected_completion_days THEN 'On_Time'
                        WHEN DATEDIFF(CURDATE(), DATE_SUB(CURDATE(), INTERVAL th.expected_completion_days DAY)) <= th.expected_completion_days + 2 THEN 'Late'
                        ELSE 'Very_Late'
                    END,
                    stp.last_assessment_score,
                    (SELECT sb.batch_name FROM student_batch_assignments sba 
                     JOIN section_batches sb ON sba.batch_id = sb.id 
                     WHERE sba.student_roll = ? AND sb.subject_id = th.subject_id AND sba.is_current = 1 LIMIT 1),
                    (SELECT sb.batch_name FROM student_batch_assignments sba 
                     JOIN section_batches sb ON sba.batch_id = sb.id 
                     WHERE sba.student_roll = ? AND sb.subject_id = th.subject_id AND sba.is_current = 1 LIMIT 1)
                FROM topic_hierarchy th
                JOIN student_topic_progress stp ON th.id = stp.topic_id
                WHERE th.id = ? AND stp.student_roll = ?
            `;

    db.query(sql, [studentRoll, studentRoll, studentRoll, topicId, studentRoll], (error, result) => {
        if (error) {
            console.error('Record completion history error:', error);
        }
    });
}

// Get topics available for assessment
exports.getAssessmentEligibleTopics = async (req, res) => {
    try {
        const { studentRoll, subjectId } = req.params;

        const sql = `
                SELECT th.*, 
                       stp.status as current_status
                FROM topic_hierarchy th
                LEFT JOIN student_topic_progress stp ON th.id = stp.topic_id AND stp.student_roll = ?
                WHERE th.subject_id = ? 
                AND th.has_assessment = 1
                AND (stp.status IN ('In Progress', 'Failed') OR stp.status IS NULL)
                ORDER BY th.level, th.order_sequence
            `;

        db.query(sql, [studentRoll, subjectId], (error, topics) => {
            if (error) {
                console.error('Get assessment eligible topics error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch assessment eligible topics',
                    error: error.message
                });
            }

            res.json({
                success: true,
                data: topics
            });
        });
    } catch (error) {
        console.error('Get assessment eligible topics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assessment eligible topics',
            error: error.message
        });
    }
}

// Delete topic from hierarchy
exports.deleteTopic = async (req, res) => {
    try {
        const { topicId } = req.params;

        // Check if topic has children
        const childCheckSql = `
                SELECT COUNT(*) as child_count 
                FROM topic_hierarchy 
                WHERE parent_id = ?
            `;

        db.query(childCheckSql, [topicId], (error, childResult) => {
            if (error) {
                console.error('Delete topic - child check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check child topics',
                    error: error.message
                });
            }

            const childCount = childResult[0]?.child_count || 0;

            if (childCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete topic that has sub-topics. Please delete sub-topics first.'
                });
            }

            // Delete the topic (cascade will handle materials, homework, etc.)
            const deleteSql = `
                    DELETE FROM topic_hierarchy 
                    WHERE id = ?
                `;

            db.query(deleteSql, [topicId], (deleteError, deleteResult) => {
                if (deleteError) {
                    console.error('Delete topic error:', deleteError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to delete topic',
                        error: deleteError.message
                    });
                }

                const affectedRows = deleteResult.affectedRows || 0;

                if (affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Topic not found'
                    });
                }

                res.json({
                    success: true,
                    message: 'Topic deleted successfully'
                });
            });
        });
    } catch (error) {
        console.error('Delete topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete topic',
            error: error.message
        });
    }
}

// Update topic
exports.updateTopic = async (req, res) => {
    try {
        const { topicId } = req.params;
        const {
            topicName, topicCode, orderSequence, hasAssessment,
            hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
        } = req.body;

        const sql = `
                UPDATE topic_hierarchy 
                SET topic_name = ?, topic_code = ?, order_sequence = ?,
                    has_assessment = ?, has_homework = ?, is_bottom_level = ?,
                    expected_completion_days = ?, pass_percentage = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

        db.query(sql, [
            topicName, topicCode, orderSequence, hasAssessment,
            hasHomework, isBottomLevel, expectedCompletionDays, passPercentage, topicId
        ], (error, results) => {
            if (error) {
                console.error('Update topic error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update topic',
                    error: error.message
                });
            }
            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Topic not found'
                });
            }

            res.json({
                success: true,
                message: 'Topic updated successfully'
            });
        });
    } catch (error) {
        console.error('Update topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update topic',
            error: error.message
        });
    }
}
