const db = require('../../config/db');

class TopicHierarchyController {
    // Get complete topic hierarchy for a subject
    static async getTopicHierarchy(req, res) {
        try {
            const { subjectId, gradeId } = req.params;
            
            const query = `
                WITH RECURSIVE topic_tree AS (
                    -- Base case: top-level topics
                    SELECT 
                        id, subject_id, parent_id, level, topic_name, topic_code, 
                        order_sequence, has_assessment, has_homework, is_bottom_level,
                        expected_completion_days, pass_percentage, 0 as depth,
                        CAST(topic_name AS CHAR(1000)) as path
                    FROM topic_hierarchy 
                    WHERE subject_id = ? AND parent_id IS NULL
                    
                    UNION ALL
                    
                    -- Recursive case: child topics
                    SELECT 
                        th.id, th.subject_id, th.parent_id, th.level, th.topic_name, th.topic_code,
                        th.order_sequence, th.has_assessment, th.has_homework, th.is_bottom_level,
                        th.expected_completion_days, th.pass_percentage, tt.depth + 1,
                        CONCAT(tt.path, ' > ', th.topic_name)
                    FROM topic_hierarchy th
                    INNER JOIN topic_tree tt ON th.parent_id = tt.id
                )
                SELECT * FROM topic_tree 
                ORDER BY level, order_sequence
            `;
            
            const [hierarchy] = await db.execute(query, [subjectId]);
            
            // Build nested structure
            const buildTree = (items, parentId = null) => {
                return items
                    .filter(item => item.parent_id === parentId)
                    .map(item => ({
                        ...item,
                        children: buildTree(items, item.id)
                    }));
            };
            
            const tree = buildTree(hierarchy);
            
            res.json({
                success: true,
                data: {
                    hierarchy: tree,
                    total_topics: hierarchy.length
                }
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
    static async createTopic(req, res) {
        try {
            const {
                subjectId, parentId, level, topicName, topicCode, orderSequence,
                hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
            } = req.body;

            console.log('Creating topic with data:', {
                subjectId, parentId, level, topicName, topicCode, orderSequence,
                hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
            });

            const query = `
                INSERT INTO topic_hierarchy 
                (subject_id, parent_id, level, topic_name, topic_code, order_sequence,
                 has_assessment, has_homework, is_bottom_level, expected_completion_days, pass_percentage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            console.log('Executing query:', query);
            console.log('With parameters:', [
                subjectId, parentId, level, topicName, topicCode, orderSequence,
                hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
            ]);

            const [result] = await db.execute(query, [
                subjectId, parentId, level, topicName, topicCode, orderSequence,
                hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
            ]);

            console.log('Insert result:', result);

            // TiDB compatibility: insertId might not be available
            const topicId = result.insertId || 'created_successfully';

            res.json({
                success: true,
                message: 'Topic created successfully',
                data: { topicId: topicId }
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
    static async getTopicMaterials(req, res) {
        try {
            const { topicId } = req.params;
            
            const query = `
                SELECT tm.*, th.topic_name
                FROM topic_materials tm
                JOIN topic_hierarchy th ON tm.topic_id = th.id
                WHERE tm.topic_id = ? AND tm.is_active = 1
                ORDER BY tm.material_type, tm.created_at
            `;
            
            const [materials] = await db.execute(query, [topicId]);
            
            res.json({
                success: true,
                data: materials
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
    static async addTopicMaterial(req, res) {
        try {
            const {
                topicId, materialType, activityName, fileName, fileUrl, 
                fileType, estimatedDuration, difficultyLevel, instructions
            } = req.body;

            const query = `
                INSERT INTO topic_materials 
                (topic_id, material_type, activity_name, file_name, file_url, 
                 file_type, estimated_duration, difficulty_level, instructions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                topicId, materialType, activityName, fileName, fileUrl,
                fileType, estimatedDuration, difficultyLevel, instructions
            ]);

            res.json({
                success: true,
                message: 'Material added successfully',
                data: { materialId: result.insertId }
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
    static async getStudentProgress(req, res) {
        try {
            const { studentRoll, subjectId } = req.params;
            
            const query = `
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
            
            const [progress] = await db.execute(query, [studentRoll, studentRoll, subjectId]);
            
            res.json({
                success: true,
                data: progress
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
    static async updateStudentProgress(req, res) {
        try {
            const { studentRoll, topicId, status, completionPercentage, assessmentScore } = req.body;
            
            const query = `
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
            
            await db.execute(query, [
                studentRoll, topicId, topicId, status, completionPercentage, assessmentScore, completedAt
            ]);

            // If completed, record in history
            if (status === 'Completed') {
                await this.recordCompletionHistory(studentRoll, topicId);
            }
            
            res.json({
                success: true,
                message: 'Student progress updated successfully'
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
    static async recordCompletionHistory(studentRoll, topicId) {
        try {
            const query = `
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
            
            await db.execute(query, [studentRoll, studentRoll, studentRoll, topicId, studentRoll]);
        } catch (error) {
            console.error('Record completion history error:', error);
        }
    }

    // Get topics available for assessment
    static async getAssessmentEligibleTopics(req, res) {
        try {
            const { studentRoll, subjectId } = req.params;
            
            const query = `
                SELECT th.*, 
                       can_take_assessment(?, th.id, th.subject_id) as can_assess,
                       stp.status as current_status
                FROM topic_hierarchy th
                LEFT JOIN student_topic_progress stp ON th.id = stp.topic_id AND stp.student_roll = ?
                WHERE th.subject_id = ? 
                AND th.has_assessment = 1
                AND (stp.status IN ('In Progress', 'Failed') OR stp.status IS NULL)
                HAVING can_assess = 1
                ORDER BY th.level, th.order_sequence
            `;
            
            const [topics] = await db.execute(query, [studentRoll, studentRoll, subjectId]);
            
            res.json({
                success: true,
                data: topics
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
    static async deleteTopic(req, res) {
        try {
            const { topicId } = req.params;
            
            // Check if topic has children
            const childCheckQuery = `
                SELECT COUNT(*) as child_count 
                FROM topic_hierarchy 
                WHERE parent_id = ?
            `;
            
            const [childResult] = await db.execute(childCheckQuery, [topicId]);
            
            if (childResult[0].child_count > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete topic that has sub-topics. Please delete sub-topics first.'
                });
            }
            
            // Delete the topic (cascade will handle materials, homework, etc.)
            const deleteQuery = `
                DELETE FROM topic_hierarchy 
                WHERE id = ?
            `;
            
            const [result] = await db.execute(deleteQuery, [topicId]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Topic not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Topic deleted successfully'
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
    static async updateTopic(req, res) {
        try {
            const { topicId } = req.params;
            const {
                topicName, topicCode, orderSequence, hasAssessment, 
                hasHomework, isBottomLevel, expectedCompletionDays, passPercentage
            } = req.body;

            const query = `
                UPDATE topic_hierarchy 
                SET topic_name = ?, topic_code = ?, order_sequence = ?,
                    has_assessment = ?, has_homework = ?, is_bottom_level = ?,
                    expected_completion_days = ?, pass_percentage = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const [result] = await db.execute(query, [
                topicName, topicCode, orderSequence, hasAssessment,
                hasHomework, isBottomLevel, expectedCompletionDays, passPercentage, topicId
            ]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Topic not found'
                });
            }

            res.json({
                success: true,
                message: 'Topic updated successfully'
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
}

module.exports = TopicHierarchyController;
