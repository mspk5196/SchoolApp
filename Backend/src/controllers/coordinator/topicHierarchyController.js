const db = require('../../config/db');

// class TopicHierarchyController {
// Get complete topic hierarchy for a subject
exports.getTopicHierarchy = (req, res) => {
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

            // Build hierarchy path for each topic
            const buildHierarchyPath = (topicId, topics, path = []) => {
                const topic = topics.find(t => t.id === topicId);
                if (!topic) return path;
                
                path.unshift(topic.topic_name);
                
                if (topic.parent_id) {
                    return buildHierarchyPath(topic.parent_id, topics, path);
                }
                
                return path;
            };

            // Add full hierarchy path to each topic
            const hierarchyWithPaths = hierarchy.map(topic => {
                const hierarchyPath = buildHierarchyPath(topic.id, hierarchy);
                const fullTopicName = hierarchyPath.join(' > ');
                
                return {
                    ...topic,
                    full_topic_name: fullTopicName,
                    hierarchy_path: hierarchyPath,
                    topic_depth: hierarchyPath.length
                };
            });

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

            const tree = buildTree(hierarchyWithPaths);

            console.log('Built tree structure:', tree);
            res.json({
                success: true, data: {
                    overallData: hierarchyWithPaths,
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
};

// Get all topics for a specific grade
exports.getTopicsByGrade = (req, res) => {
    try {
        const { gradeId, subjectId } = req.params;

        const sql = `
            SELECT DISTINCT th.id, th.subject_id, th.topic_name, th.topic_code, 
                   th.level, th.is_bottom_level, th.order_sequence, th.parent_id, s.subject_name
            FROM topic_hierarchy th
            JOIN subjects s ON th.subject_id = s.id
            JOIN section_subject_activities ssa ON s.id = ssa.subject_id
            JOIN sections sec ON ssa.section_id = sec.id
            WHERE sec.grade_id = ? AND th.subject_id = ?
            ORDER BY s.subject_name, th.level, th.order_sequence
        `;

        db.query(sql, [gradeId, subjectId], (err, result) => {
            if (err) {
                console.error('Error fetching topics by grade:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to fetch topics' 
                });
            }

            // Build hierarchy path for each topic
            const buildHierarchyPath = (topicId, topics, path = []) => {
                const topic = topics.find(t => t.id === topicId);
                if (!topic) return path;
                
                path.unshift(topic.topic_name);
                
                if (topic.parent_id) {
                    return buildHierarchyPath(topic.parent_id, topics, path);
                }
                
                return path;
            };

            // Add full hierarchy path to each topic
            const topicsWithPaths = result.map(topic => {
                const hierarchyPath = buildHierarchyPath(topic.id, result);
                const fullTopicName = hierarchyPath.join(' > ');
                
                return {
                    ...topic,
                    full_topic_name: fullTopicName,
                    hierarchy_path: hierarchyPath,
                    topic_depth: hierarchyPath.length
                };
            });

            res.json({
                success: true,
                data: topicsWithPaths || []
            });
        });
    } catch (error) {
        console.error('Get topics by grade error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch topics',
            error: error.message
        });
    }
};

// Get topic hierarchy by activity (NEW FUNCTION)
exports.getTopicHierarchyByActivity = (req, res) => {
    try {
        const { activityId, subActivityId } = req.body;

        // Get section_subject_activity details first
        const activitySql = `
            SELECT ssa.id, ssa.section_id, ssa.subject_id, ssa.activity_type,
                   s.subject_name, sec.section_name, at.activity_type as activity_name
            FROM section_subject_activities ssa
            JOIN subjects s ON ssa.subject_id = s.id
            JOIN sections sec ON ssa.section_id = sec.id
            JOIN activity_types at ON ssa.activity_type = at.id
            WHERE ssa.id = ?
        `;

        db.query(activitySql, [activityId], (err, activityResult) => {
            if (err) {
                console.error('Get activity details error:', err);
                return res.status(500).json({ success: false, message: 'Failed to fetch activity details' });
            }

            if (activityResult.length === 0) {
                return res.status(404).json({ success: false, message: 'Activity not found' });
            }

            const activity = activityResult[0];

            // Get topic hierarchy for this activity
            const sql = `
                SELECT 
                    id, subject_id, section_subject_activity_id, parent_id, level, topic_name, topic_code, ssa_sub_activity_id,
                    order_sequence, has_assessment, has_homework, is_bottom_level,
                    expected_completion_days, pass_percentage, created_at, updated_at
                FROM topic_hierarchy 
                WHERE section_subject_activity_id = ? AND ssa_sub_activity_id = ?
                ORDER BY level, order_sequence
            `;

            console.log('Executing hierarchy query for activityId:', activityId, 'subActivityId:', subActivityId);

            db.query(sql, [activityId, subActivityId], (err, result) => {
                if (err) {
                    console.error('Get topic hierarchy by activity error:', err);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }

                if (result.length === 0) {
                    return res.json({ 
                        success: true, 
                        data: {
                            activity: activity,
                            hierarchy: [],
                            total_topics: 0
                        }
                    });
                }

                console.log('Hierarchy query result:', result);

                // Build hierarchy path for each topic
                const buildHierarchyPath = (topicId, topics, path = []) => {
                    const topic = topics.find(t => t.id === topicId);
                    if (!topic) return path;
                    
                    path.unshift(topic.topic_name);
                    
                    if (topic.parent_id) {
                        return buildHierarchyPath(topic.parent_id, topics, path);
                    }
                    
                    return path;
                };

                // Add full hierarchy path to each topic
                const hierarchyWithPaths = result.map(topic => {
                    const hierarchyPath = buildHierarchyPath(topic.id, result);
                    const fullTopicName = hierarchyPath.join(' > ');
                    
                    return {
                        ...topic,
                        full_topic_name: fullTopicName,
                        hierarchy_path: hierarchyPath,
                        topic_depth: hierarchyPath.length
                    };
                });

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

                const tree = buildTree(hierarchyWithPaths);

                console.log('Built tree structure:', tree);
                res.json({
                    success: true, 
                    data: {
                        activity: activity,
                        overallData: hierarchyWithPaths,
                        hierarchy: tree,
                        total_topics: result.length
                    }
                });
            });
        });
    } catch (error) {
        console.error('Get topic hierarchy by activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch topic hierarchy',
            error: error.message
        });
    }
}

// Create new topic in hierarchy
exports.createTopic = (req, res) => {
    try {
        const {
            subjectId, sectionSubjectActivityId, parentId, level, topicName, topicCode, orderSequence,
            hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage, ssaSubActivityId
        } = req.body;

        // Check if we're using the new activity-based approach or the old subject-based approach
        if (sectionSubjectActivityId && ssaSubActivityId) {
            // New activity-based approach - first get the subject_id from section_subject_activities
            const getSubjectSql = `
                SELECT subject_id FROM section_subject_activities WHERE id = ?
            `;
            
            db.query(getSubjectSql, [sectionSubjectActivityId], (subjectError, subjectResult) => {
                if (subjectError) {
                    console.error('Error getting subject_id:', subjectError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to get subject information',
                        error: subjectError.message
                    });
                }
                
                if (subjectResult.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Section subject activity not found'
                    });
                }
                
                const subjectIdFromActivity = subjectResult[0].subject_id;
                
                const sql = `
                    INSERT INTO topic_hierarchy 
                    (subject_id, section_subject_activity_id, parent_id, level, topic_name, topic_code, order_sequence,
                     has_assessment, has_homework, is_bottom_level, expected_completion_days, pass_percentage, ssa_sub_activity_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                console.log('Creating topic with activity-based approach. Parameters:', [
                    subjectIdFromActivity, sectionSubjectActivityId, parentId, level, topicName, topicCode, orderSequence,
                    hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage, ssaSubActivityId
                ]);

                db.query(sql, [
                    subjectIdFromActivity, sectionSubjectActivityId, parentId, level, topicName, topicCode, orderSequence,
                    hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage, ssaSubActivityId
                ], (error, result) => {
                    if (error) {
                        console.error('Insert topic error (activity-based):', error);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create topic',
                            error: error.message
                        });
                    }

                    res.json({
                        success: true,
                        message: 'Topic created successfully',
                        data: { topicId: result.insertId }
                    });
                });
            });
        } else if (subjectId) {
            // Legacy subject-based approach (for backward compatibility)
            const sql = `
                INSERT INTO topic_hierarchy 
                (subject_id, parent_id, level, topic_name, topic_code, order_sequence,
                 has_assessment, has_homework, is_bottom_level, expected_completion_days, pass_percentage, ssa_sub_activity_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            console.log('Creating topic with subject-based approach. Parameters:', [
                subjectId, parentId, level, topicName, topicCode, orderSequence,
                hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage, ssaSubActivityId
            ]);

            db.query(sql, [
                subjectId, parentId, level, topicName, topicCode, orderSequence,
                hasAssessment, hasHomework, isBottomLevel, expectedCompletionDays, passPercentage, ssaSubActivityId
            ], (error, result) => {
                if (error) {
                    console.error('Insert topic error (subject-based):', error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create topic',
                        error: error.message
                    });
                }

                res.json({
                    success: true,
                    message: 'Topic created successfully',
                    data: { topicId: result.insertId }
                });
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either sectionSubjectActivityId or subjectId is required'
            });
        }
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create topic',
            error: error.message
        });
    }
}

// Get topic materials
exports.getTopicMaterials = (req, res) => {
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
};

// Add material to topic with file upload
exports.uploadTopicMaterials = async (req, res) => {
    try {
        const {
            topicId, materialType, activityName,
            estimatedDuration, difficultyLevel, instructions,
            expectedDate, hasAssessment
        } = req.body;

        console.log('Uploading topic materials with data:', {
            topicId, materialType, activityName,
            estimatedDuration, difficultyLevel, instructions,
            expectedDate, hasAssessment
        });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        // Process each uploaded file
        const fileData = req.files.map(file => ({
            name: file.originalname,
            url: `/uploads/materials/${file.filename}`,
            type: getFileTypeFromExtension(file.originalname),
            size: file.size
        }));

        // For multiple files, we'll store the first file in the main columns
        // and all files in a JSON format in file_url (we'll extend this field)
        const primaryFile = fileData[0];
        const allFilesJson = JSON.stringify(fileData);

        // Store material with file references
        const sql = `
            INSERT INTO topic_materials 
            (topic_id, material_type, activity_name, file_name, file_url, file_type,
             estimated_duration, difficulty_level, instructions, expected_date, has_assessment)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            topicId, materialType, activityName, 
            primaryFile.name, allFilesJson, primaryFile.type,
            estimatedDuration, difficultyLevel, instructions, 
            expectedDate || null, hasAssessment === 'true' || hasAssessment === true
        ], (error, result) => {
            if (error) {
                console.error('Upload topic materials error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save material',
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
                message: 'Materials uploaded successfully',
                data: { 
                    materialId: materialId,
                    files: fileData 
                }
            });
        });
    } catch (error) {
        console.error('Upload topic materials error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload materials',
            error: error.message
        });
    }
};

// Helper function to determine file type
function getFileTypeFromExtension(fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf': return 'PDF';
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'mkv':
        case 'webm': return 'Video';
        case 'doc':
        case 'docx':
        case 'txt': return 'Text';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif': return 'Image';
        case 'mp3':
        case 'wav':
        case 'aac': return 'Audio';
        default: return 'Document';
    }
}

// Update existing topic material
exports.updateTopicMaterial = async (req, res) => {
    try {
        const { materialId } = req.params;
        const {
            materialType,
            activityName,
            estimatedDuration,
            difficultyLevel,
            instructions,
            expectedDate,
            hasAssessment
        } = req.body;

        console.log('Updating material with ID:', materialId);
        console.log('Update data:', req.body);

        // First check if the material exists
        const checkSql = 'SELECT * FROM topic_materials WHERE id = ?';
        
        db.query(checkSql, [materialId], (checkError, checkResult) => {
            if (checkError) {
                console.error('Check material error:', checkError);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check material existence',
                    error: checkError.message
                });
            }

            if (checkResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            // Update the material (without changing files for now)
            const updateSql = `
                UPDATE topic_materials 
                SET material_type = ?, activity_name = ?, estimated_duration = ?,
                    difficulty_level = ?, instructions = ?, expected_date = ?, 
                    has_assessment = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            db.query(updateSql, [
                materialType, activityName, estimatedDuration,
                difficultyLevel, instructions, expectedDate || null, 
                hasAssessment === 'true' || hasAssessment === true, materialId
            ], (updateError, updateResult) => {
                if (updateError) {
                    console.error('Update material error:', updateError);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update material',
                        error: updateError.message
                    });
                }

                console.log('Material updated successfully');
                res.json({
                    success: true,
                    message: 'Material updated successfully',
                    data: {
                        id: materialId,
                        material_type: materialType,
                        activity_name: activityName,
                        estimated_duration: estimatedDuration,
                        difficulty_level: difficultyLevel,
                        instructions: instructions
                    }
                });
            });
        });
    } catch (error) {
        console.error('Update material error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update material',
            error: error.message
        });
    }
}

// Delete material
exports.deleteMaterial = async (req, res) => {
    try {
        const { materialId } = req.params;

        const sql = `
            UPDATE topic_materials 
            SET is_active = 0 
            WHERE id = ?
        `;

        db.query(sql, [materialId], (error, result) => {
            if (error) {
                console.error('Delete material error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete material',
                    error: error.message
                });
            }

            const affectedRows = result.affectedRows || 0;

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            res.json({
                success: true,
                message: 'Material deleted successfully'
            });
        });
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete material',
            error: error.message
        });
    }
};

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

// Download file function
exports.downloadFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const path = require('path');
        const fs = require('fs');
        
        console.log('Download request for filename:', filename);
        
        // Construct the full file path
        const filePath = path.join(__dirname, '../../../uploads/materials', filename);
        console.log('Looking for file at path:', filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error('File not found at path:', filePath);
            return res.status(404).json({
                success: false,
                message: 'File not found',
                path: filePath,
                filename: filename
            });
        }

        // Get file stats for size
        const stats = fs.statSync(filePath);
        console.log('File found, size:', stats.size, 'bytes');
        
        // Set appropriate headers
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';
        
        switch (ext) {
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.mp4':
                contentType = 'video/mp4';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.mp3':
                contentType = 'audio/mpeg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
            case '.doc':
                contentType = 'application/msword';
                break;
            case '.docx':
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.on('error', (err) => {
            console.error('File stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error reading file'
                });
            }
        });
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('Download file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download file',
            error: error.message
        });
    }
}

// View file function (for PDFs, images - inline viewing)
exports.viewFile = async (req, res) => {
    try {
        const { filename } = req.params;
        const path = require('path');
        const fs = require('fs');
        
        console.log('View request for filename:', filename);
        
        // Construct the full file path
        const filePath = path.join(__dirname, '../../../uploads/materials', filename);
        console.log('Looking for file at path:', filePath);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error('File not found at path:', filePath);
            return res.status(404).json({
                success: false,
                message: 'File not found',
                path: filePath,
                filename: filename
            });
        }

        // Get file stats for size
        const stats = fs.statSync(filePath);
        console.log('File found, size:', stats.size, 'bytes');
        
        // Set appropriate headers for viewing (not downloading)
        const ext = path.extname(filename).toLowerCase();
        let contentType = 'application/octet-stream';
        
        switch (ext) {
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.mp4':
                contentType = 'video/mp4';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.mp3':
                contentType = 'audio/mpeg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', stats.size);
        // For viewing, don't set Content-Disposition to attachment
        
        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.on('error', (err) => {
            console.error('File stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error reading file'
                });
            }
        });
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('View file error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to view file',
            error: error.message
        });
    }
}

// Get actual section_subject_activities records (not just activity types)
exports.getSectionSubjectActivitiesRecords = (req, res) => {
  const { sectionId, subjectId } = req.params;

  console.log('Getting section subject activities for:', { sectionId, subjectId });

  const sql = `
    SELECT ssa.id, ssa.section_id, ssa.subject_id, ssa.activity_type,
           at.activity_type as activity_name,
           s.subject_name,
           sec.section_name
    FROM section_subject_activities ssa
    JOIN activity_types at ON ssa.activity_type = at.id
    JOIN subjects s ON ssa.subject_id = s.id
    JOIN sections sec ON ssa.section_id = sec.id
    WHERE ssa.section_id = ? AND ssa.subject_id = ?
    ORDER BY at.activity_type
  `;
  
  db.query(sql, [sectionId, subjectId], (err, results) => {
    if (err) {
      console.error("Error fetching section subject activities:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    console.log('Section subject activities results:', results);
    res.json({ success: true, message: "Section subject activities fetched successfully", sectionSubjectActivity: results });
  });
};

exports.getSectionSubjectSubActivitiesRecords = (req, res) => {
  const { activityId, subjectId } = req.params;

  console.log('Getting section subject activities for:', { activityId, subjectId });

  const sql = `
    SELECT ssa.id, at.sub_act_name
    FROM ssa_sub_activities ssa
    JOIN sub_activities at ON ssa.sub_act_id = at.id
    WHERE ssa.ssa_id = ?
  `;
  
  db.query(sql, [activityId], (err, results) => {
    if (err) {
      console.error("Error fetching section subject sub activities:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    console.log('Section subject sub activities results:', results);
    res.json({ success: true, message: "Section subject sub activities fetched successfully", sectionSubjectSubActivity: results });
  });
};