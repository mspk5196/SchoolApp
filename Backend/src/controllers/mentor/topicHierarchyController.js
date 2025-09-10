const db = require('../../config/db');

// Get complete topic hierarchy for a subject (mentor view - read only)
exports.getTopicHierarchy = (req, res) => {
    try {
        const { subjectId, gradeId } = req.body;
        if (!subjectId || !gradeId) {
            return res.status(400).json({
                success: false,
                message: 'Subject ID and Grade ID are required'
            });
        }

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

// Get topic materials (mentor view - read only)
exports.getTopicMaterials = (req, res) => {
    try {
        const { topicId } = req.params;

        if (!topicId) {
            return res.status(400).json({
                success: false,
                message: 'Topic ID is required'
            });
        }

        const sql = `
            SELECT tm.*, th.topic_name
            FROM topic_materials tm
            JOIN topic_hierarchy th ON tm.topic_id = th.id
            WHERE tm.topic_id = ? AND tm.is_active = 1
            ORDER BY tm.material_type, tm.created_at
        `;

        db.query(sql, [topicId], (error, materials) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch topic materials',
                    error: error.message
                });
            }

            // Parse file URLs if they're stored as JSON
            const processedMaterials = materials.map(material => {
                let fileUrls = [];
                try {
                    if (material.file_url) {
                        const parsed = JSON.parse(material.file_url);
                        fileUrls = Array.isArray(parsed) ? parsed : [parsed];
                    }
                } catch (parseError) {
                    // If not JSON, treat as single URL
                    fileUrls = material.file_url ? [{ url: material.file_url, name: material.material_name }] : [];
                }
                console.log('Processed file URLs for material:', material.id, fileUrls);
                
                return {
                    ...material,
                    file_urls: fileUrls,
                    download_count: fileUrls.length
                };
            });

            res.status(200).json({
                success: true,
                message: 'Topic materials fetched successfully',
                data: {
                    materials: processedMaterials,
                    topic_name: materials.length > 0 ? materials[0].topic_name : '',
                    topic_code: materials.length > 0 ? materials[0].topic_code : '',
                    total_materials: materials.length
                }
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
};

// Get section subject activities for mentor
exports.getSectionSubjectActivitiesRecords = (req, res) => {
  const { sectionId, subjectId } = req.body;

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
    res.json({ success: true, message: "Section subject activities fetched successfully", data: results });
  });
};

// Get section subject sub-activities for mentor
exports.getSectionSubjectSubActivitiesRecords = (req, res) => {
  const { activityId, subjectId } = req.body;

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
    res.json({ success: true, message: "Section subject sub activities fetched successfully", data: results });
  });
};

// Get student progress for topics (mentor view)
exports.getStudentTopicProgress = (req, res) => {
    try {
        const { topicId, sectionId } = req.body;

        if (!topicId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Topic ID and Section ID are required'
            });
        }

        const sql = `
            SELECT 
                stp.student_roll,
                stp.topic_id,
                stp.progress_percentage,
                stp.completion_status,
                stp.last_activity_date,
                stp.time_spent_minutes,
                st.student_name,
                st.section_id,
                th.topic_name,
                th.topic_code
            FROM student_topic_progress stp
            JOIN students st ON stp.student_roll = st.student_roll
            JOIN topic_hierarchy th ON stp.topic_id = th.id
            WHERE stp.topic_id = ? AND st.section_id = ?
            ORDER BY st.student_name
        `;

        db.query(sql, [topicId, sectionId], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to fetch student progress',
                    error: error.message
                });
            }

            res.status(200).json({
                success: true,
                message: 'Student progress fetched successfully',
                data: {
                    progress: results,
                    topic_name: results.length > 0 ? results[0].topic_name : '',
                    topic_code: results.length > 0 ? results[0].topic_code : '',
                    total_students: results.length
                }
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
};

module.exports = exports;
