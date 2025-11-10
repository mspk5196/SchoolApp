const db = require('../../config/db');

// Get all sections for a specific grade
exports.getGradeSections = (req, res) => {
    const { gradeID } = req.body;

    if (!gradeID) {
        return res.status(400).json({ success: false, message: 'Grade ID is required' });
    }

    const sql = `
        SELECT 
            s.id,
            CONCAT('Section ', s.section_name) AS section_name,
            s.grade_id
        FROM sections s
        WHERE s.grade_id = ? AND s.is_active = 1
        ORDER BY s.section_name
    `;

    db.query(sql, [gradeID], (err, results) => {
        if (err) {
            console.error('Error fetching grade sections:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ 
            success: true, 
            gradeSections: results 
        });
    });
};

// Get all subjects
exports.getSubjects = (req, res) => {
    const sql = `
        SELECT 
            id,
            subject_name
        FROM subjects
        ORDER BY subject_name
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ 
            success: true, 
            subjects: results 
        });
    });
};

// Get all activities (all activities regardless of level - for selection)
exports.getActivities = (req, res) => {
    const sql = `
        SELECT 
            id,
            name AS activity_type,
            description,
            level,
            parent_id
        FROM activities
        ORDER BY name
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching activities:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ 
            success: true, 
            activity_types: results 
        });
    });
};

// Get all sub-activities (same as activities - for compatibility, returns all activities)
exports.getSubActivities = (req, res) => {
    const sql = `
        SELECT 
            a.id,
            a.name AS sub_act_name,
            a.description,
            a.parent_id,
            a.level
        FROM activities a
        ORDER BY a.name
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching sub-activities:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({ 
            success: true, 
            sub_activities: results 
        });
    });
};

// Get all subject-activity mappings for a section with their sub-activities (recursive tree)
exports.getSubjectActivities = (req, res) => {
    const { sectionID } = req.body;

    if (!sectionID) {
        return res.status(400).json({ success: false, message: 'Section ID is required' });
    }

    // First, get section details to retrieve grade_id
    const sectionSql = `SELECT grade_id FROM sections WHERE id = ?`;
    
    db.query(sectionSql, [sectionID], (err, sectionResults) => {
        if (err) {
            console.error('Error fetching section:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (sectionResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        const gradeID = sectionResults[0].grade_id;

        // Step 1: Get all subjects assigned to this section
        const subjectsSql = `
            SELECT DISTINCT
                s.id as subject_id,
                s.subject_name
            FROM subject_section_assignments ssa
            INNER JOIN subjects s ON ssa.subject_id = s.id
            WHERE ssa.grade_id = ? 
                AND ssa.section_id = ? 
                AND ssa.is_active = 1
            ORDER BY s.subject_name
        `;

        db.query(subjectsSql, [gradeID, sectionID], (err, subjects) => {
            if (err) {
                console.error('Error fetching subjects:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (subjects.length === 0) {
                return res.json({ success: true, subjects: [] });
            }

            // Step 2: Get ALL context_activities for this grade/section (all levels)
            const activitiesSql = `
                SELECT 
                    ca.id as context_id,
                    ca.subject_id,
                    ca.activity_id,
                    ca.parent_context_id,
                    a.name as activity_name,
                    a.level
                FROM context_activities ca
                INNER JOIN activities a ON ca.activity_id = a.id
                WHERE ca.grade_id = ? 
                    AND ca.section_id = ?
                ORDER BY ca.parent_context_id, a.name
            `;

            db.query(activitiesSql, [gradeID, sectionID], (err, allActivities) => {
                if (err) {
                    console.error('Error fetching activities:', err);
                    return res.status(500).json({ success: false, message: 'Database error' });
                }

                // Helper function to recursively build tree
                const buildTree = (parentContextId, subjectId) => {
                    const children = allActivities.filter(
                        act => act.parent_context_id === parentContextId && act.subject_id === subjectId
                    );
                    
                    return children.map(child => ({
                        context_id: child.context_id,
                        activity_id: child.activity_id,
                        activity_name: child.activity_name,
                        level: child.level,
                        children: buildTree(child.context_id, subjectId) // Recursive call
                    }));
                };

                // Step 3: Structure the data with recursive tree
                const structuredData = subjects.map(subject => {
                    const rootActivities = buildTree(null, subject.subject_id);
                    
                    return {
                        subject_id: subject.subject_id,
                        subject_name: subject.subject_name,
                        activities: rootActivities
                    };
                });

                res.json({ 
                    success: true, 
                    subjects: structuredData 
                });
            });
        });
    });
};

// Add a subject to a section (creates subject_section_assignment)
exports.addSubjectToSection = (req, res) => {
    const { section_id, subject_id } = req.body;
    const created_by = req.user?.id || null;

    if (!section_id || !subject_id) {
        return res.status(400).json({ success: false, message: 'Section ID and Subject ID are required' });
    }

    // Get grade_id from section
    const gradeSql = `SELECT grade_id FROM sections WHERE id = ?`;
    
    db.query(gradeSql, [section_id], (err, gradeResults) => {
        if (err) {
            console.error('Error fetching section:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (gradeResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        const grade_id = gradeResults[0].grade_id;

        // Check if subject is already assigned to this section
        const checkSql = `
            SELECT id FROM subject_section_assignments 
            WHERE subject_id = ? AND grade_id = ? AND section_id = ? AND is_active = 1
        `;
        
        db.query(checkSql, [subject_id, grade_id, section_id], (err, existing) => {
            if (err) {
                console.error('Error checking existing assignment:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Subject already assigned to this section' });
            }

            // Insert into subject_section_assignments
            const insertSql = `
                INSERT INTO subject_section_assignments 
                (subject_id, grade_id, section_id, is_active, created_by, created_at)
                VALUES (?, ?, ?, 1, ?, NOW())
            `;

            db.query(insertSql, [subject_id, grade_id, section_id, created_by], (err, result) => {
                if (err) {
                    console.error('Error adding subject to section:', err);
                    return res.status(500).json({ success: false, message: 'Failed to add subject' });
                }

                res.json({ 
                    success: true, 
                    message: 'Subject added to section successfully',
                    id: result.insertId
                });
            });
        });
    });
};

// Remove a subject from a section (soft delete by setting is_active = 0)
exports.removeSubject = (req, res) => {
    const { section_id, subject_id } = req.body;

    if (!section_id || !subject_id) {
        return res.status(400).json({ success: false, message: 'Section ID and Subject ID are required' });
    }

    // Get grade_id from section
    const gradeSql = `SELECT grade_id FROM sections WHERE id = ?`;
    
    db.query(gradeSql, [section_id], (err, gradeResults) => {
        if (err) {
            console.error('Error fetching section:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (gradeResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        const grade_id = gradeResults[0].grade_id;

        // Also delete all context_activities for this subject in this section
        const deleteContextSql = `
            DELETE FROM context_activities 
            WHERE subject_id = ? AND grade_id = ? AND section_id = ?
        `;

        db.query(deleteContextSql, [subject_id, grade_id, section_id], (err) => {
            if (err) {
                console.error('Error removing context activities:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            // Soft delete subject_section_assignment
            const updateSql = `
                UPDATE subject_section_assignments 
                SET is_active = 0 
                WHERE subject_id = ? AND grade_id = ? AND section_id = ?
            `;

            db.query(updateSql, [subject_id, grade_id, section_id], (err, result) => {
                if (err) {
                    console.error('Error removing subject:', err);
                    return res.status(500).json({ success: false, message: 'Failed to remove subject' });
                }

                res.json({ 
                    success: true, 
                    message: 'Subject removed from section successfully' 
                });
            });
        });
    });
};

// Add activity to a subject in a section (creates context_activities entry)
exports.addSubjectActivity = (req, res) => {
    const { section_id, subject_id, activity_type } = req.body;

    if (!section_id || !subject_id || !activity_type) {
        return res.status(400).json({ success: false, message: 'Section ID, Subject ID, and Activity Type are required' });
    }

    // Get grade_id from section
    const gradeSql = `SELECT grade_id FROM sections WHERE id = ?`;
    
    db.query(gradeSql, [section_id], (err, gradeResults) => {
        if (err) {
            console.error('Error fetching section:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (gradeResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        const grade_id = gradeResults[0].grade_id;

        // Check if this activity is already assigned
        const checkSql = `
            SELECT id FROM context_activities 
            WHERE grade_id = ? AND section_id = ? AND subject_id = ? AND activity_id = ? AND parent_context_id IS NULL
        `;
        
        db.query(checkSql, [grade_id, section_id, subject_id, activity_type], (err, existing) => {
            if (err) {
                console.error('Error checking existing activity:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Activity already assigned to this subject' });
            }

            // Insert into context_activities
            const insertSql = `
                INSERT INTO context_activities 
                (grade_id, section_id, subject_id, activity_id, parent_context_id, created_at)
                VALUES (?, ?, ?, ?, NULL, NOW())
            `;

            db.query(insertSql, [grade_id, section_id, subject_id, activity_type], (err, result) => {
                if (err) {
                    console.error('Error adding subject activity:', err);
                    return res.status(500).json({ success: false, message: 'Failed to add activity' });
                }

                res.json({ 
                    success: true, 
                    message: 'Activity added successfully',
                    id: result.insertId
                });
            });
        });
    });
};

// Remove an activity from a subject (deletes context_activities entry)
exports.removeSubjectActivity = (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Context Activity ID is required' });
    }

    // Delete the activity and all its sub-activities
    const deleteSql = `
        DELETE FROM context_activities 
        WHERE id = ? OR parent_context_id = ?
    `;

    db.query(deleteSql, [id, id], (err, result) => {
        if (err) {
            console.error('Error removing activity:', err);
            return res.status(500).json({ success: false, message: 'Failed to remove activity' });
        }

        res.json({ 
            success: true, 
            message: 'Activity removed successfully' 
        });
    });
};

// Add sub-activity to an activity (creates child context_activities entry - supports infinite nesting)
exports.addSubjectSubActivity = (req, res) => {
    const { ssaID, subActivityId } = req.body;

    if (!ssaID || !subActivityId) {
        return res.status(400).json({ success: false, message: 'Parent Context Activity ID and Sub-Activity ID are required' });
    }

    // Get parent context activity details
    const parentSql = `
        SELECT grade_id, section_id, subject_id 
        FROM context_activities 
        WHERE id = ?
    `;
    
    db.query(parentSql, [ssaID], (err, parentResults) => {
        if (err) {
            console.error('Error fetching parent activity:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (parentResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Parent activity not found' });
        }

        const { grade_id, section_id, subject_id } = parentResults[0];

        // Check if this sub-activity is already assigned to this parent
        const checkSql = `
            SELECT id FROM context_activities 
            WHERE grade_id = ? AND section_id = ? AND subject_id = ? AND activity_id = ? AND parent_context_id = ?
        `;
        
        db.query(checkSql, [grade_id, section_id, subject_id, subActivityId, ssaID], (err, existing) => {
            if (err) {
                console.error('Error checking existing sub-activity:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: 'Sub-activity already assigned to this parent' });
            }

            // Insert sub-activity (no level restriction)
            const insertSql = `
                INSERT INTO context_activities 
                (grade_id, section_id, subject_id, activity_id, parent_context_id, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `;

            db.query(insertSql, [grade_id, section_id, subject_id, subActivityId, ssaID], (err, result) => {
                if (err) {
                    console.error('Error adding sub-activity:', err);
                    return res.status(500).json({ success: false, message: 'Failed to add sub-activity' });
                }

                res.json({ 
                    success: true, 
                    message: 'Sub-activity added successfully',
                    id: result.insertId
                });
            });
        });
    });
};

// Remove a sub-activity (deletes child context_activities entry)
exports.removeSubjectSubActivity = (req, res) => {
    const { subject_sub_activity_id } = req.body;

    if (!subject_sub_activity_id) {
        return res.status(400).json({ success: false, message: 'Sub-Activity ID is required' });
    }

    const deleteSql = `
        DELETE FROM context_activities 
        WHERE id = ?
    `;

    db.query(deleteSql, [subject_sub_activity_id], (err, result) => {
        if (err) {
            console.error('Error removing sub-activity:', err);
            return res.status(500).json({ success: false, message: 'Failed to remove sub-activity' });
        }

        res.json({ 
            success: true, 
            message: 'Sub-activity removed successfully' 
        });
    });
};

// Add new subjects to the system
exports.addSubjects = (req, res) => {
    const { subjects } = req.body;
    const created_by = req.user?.id || null;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ success: false, message: 'Subjects array is required' });
    }

    // Prepare bulk insert
    const values = subjects.map(s => [s.name, created_by, new Date()]);
    const placeholders = subjects.map(() => '(?, ?, ?)').join(', ');

    const sql = `
        INSERT INTO subjects (subject_name, created_by, created_at)
        VALUES ${placeholders}
    `;

    const flatValues = values.flat();

    db.query(sql, flatValues, (err, result) => {
        if (err) {
            console.error('Error adding subjects:', err);
            return res.status(500).json({ success: false, message: 'Failed to add subjects' });
        }

        res.json({ 
            success: true, 
            message: 'Subjects added successfully',
            insertedCount: result.affectedRows
        });
    });
};

// Add new activities to the system (supports any level)
exports.addActivities = (req, res) => {
    const { activities } = req.body;

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({ success: false, message: 'Activities array is required' });
    }

    // Prepare bulk insert - automatically calculate level as 1 for root activities
    const values = activities.map(a => [a.name, a.description || null, null, 1, new Date()]);
    const placeholders = activities.map(() => '(?, ?, ?, ?, ?)').join(', ');

    const sql = `
        INSERT INTO activities (name, description, parent_id, level, created_at)
        VALUES ${placeholders}
    `;

    const flatValues = values.flat();

    db.query(sql, flatValues, (err, result) => {
        if (err) {
            console.error('Error adding activities:', err);
            return res.status(500).json({ success: false, message: 'Failed to add activities' });
        }

        res.json({ 
            success: true, 
            message: 'Activities added successfully',
            insertedCount: result.affectedRows
        });
    });
};

// Add new sub-activities to the system (supports any level, calculates level automatically)
exports.addSubActivities = (req, res) => {
    const { activities } = req.body;

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({ success: false, message: 'Sub-activities array is required' });
    }

    // For sub-activities without parent, create as level 1
    // If parent_id exists, we'll calculate level in a trigger or set as level 2 by default
    const values = activities.map(a => [
        a.name, 
        a.description || null, 
        a.parent_id || null, 
        a.parent_id ? 2 : 1, // Default level based on whether parent exists
        new Date()
    ]);
    const placeholders = activities.map(() => '(?, ?, ?, ?, ?)').join(', ');

    const sql = `
        INSERT INTO activities (name, description, parent_id, level, created_at)
        VALUES ${placeholders}
    `;

    const flatValues = values.flat();

    db.query(sql, flatValues, (err, result) => {
        if (err) {
            console.error('Error adding sub-activities:', err);
            return res.status(500).json({ success: false, message: 'Failed to add sub-activities' });
        }

        res.json({ 
            success: true, 
            message: 'Sub-activities added successfully',
            insertedCount: result.affectedRows
        });
    });
};

module.exports = exports;
