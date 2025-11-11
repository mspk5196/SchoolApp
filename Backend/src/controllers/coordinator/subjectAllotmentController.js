const db = require('../../config/db');

// Get all sections for a specific grade (promise-based)
exports.getGradeSections = async (req, res) => {
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
    try {
        const [results] = await db.query(sql, [gradeID]);
        res.json({ success: true, gradeSections: results });
    } catch (err) {
        console.error('Error fetching grade sections:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
};

// Get all subjects (promise-based)
exports.getSubjects = async (req, res) => {
    const sql = `
        SELECT 
            id,
            subject_name
        FROM subjects
        ORDER BY subject_name
    `;

    try {
        const [results] = await db.query(sql);
        res.json({ success: true, subjects: results });
    } catch (err) {
        console.error('Error fetching subjects:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
};

// Get all activities (promise-based)
exports.getActivities = async (req, res) => {
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

    try {
        const [results] = await db.query(sql);
        res.json({ success: true, activity_types: results });
    } catch (err) {
        console.error('Error fetching activities:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
};

// Get all sub-activities (promise-based)
exports.getSubActivities = async (req, res) => {
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

    try {
        const [results] = await db.query(sql);
        res.json({ success: true, sub_activities: results });
    } catch (err) {
        console.error('Error fetching sub-activities:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
};

// Get all subject-activity mappings for a section with their sub-activities (recursive tree, promise-based)
exports.getSubjectActivities = async (req, res) => {
    const { sectionID } = req.body;

    if (!sectionID) {
        return res.status(400).json({ success: false, message: 'Section ID is required' });
    }

    try {
        // Section -> grade
        const [sectionRows] = await db.query('SELECT grade_id FROM sections WHERE id = ?', [sectionID]);
        if (!sectionRows || sectionRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }
        const gradeID = sectionRows[0].grade_id;

        // Subjects for section
        const subjectsSql = `
            SELECT DISTINCT s.id as subject_id, s.subject_name
            FROM subject_section_assignments ssa
            INNER JOIN subjects s ON ssa.subject_id = s.id
            WHERE ssa.grade_id = ? AND ssa.section_id = ? AND ssa.is_active = 1
            ORDER BY s.subject_name`;
        const [subjects] = await db.query(subjectsSql, [gradeID, sectionID]);
        if (!subjects || subjects.length === 0) {
            return res.json({ success: true, subjects: [] });
        }

        // All context_activities for the section
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
            WHERE ca.grade_id = ? AND ca.section_id = ?
            ORDER BY ca.parent_context_id, a.name`;
        const [allActivities] = await db.query(activitiesSql, [gradeID, sectionID]);

        const buildTree = (parentContextId, subjectId) => {
            const children = allActivities.filter(
                act => act.parent_context_id === parentContextId && act.subject_id === subjectId
            );
            return children.map(child => ({
                context_id: child.context_id,
                activity_id: child.activity_id,
                activity_name: child.activity_name,
                level: child.level,
                children: buildTree(child.context_id, subjectId)
            }));
        };

        const structuredData = subjects.map(subject => ({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
            activities: buildTree(null, subject.subject_id)
        }));

        return res.json({ success: true, subjects: structuredData });
    } catch (err) {
        console.error('Error fetching subject activities:', err);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
};

// Add a subject to a section (creates subject_section_assignment, promise-based)
exports.addSubjectToSection = async (req, res) => {
    const { section_id, subject_id } = req.body;
    const created_by = req.user?.id || null;

    if (!section_id || !subject_id) {
        return res.status(400).json({ success: false, message: 'Section ID and Subject ID are required' });
    }
    try {
        const [gradeRows] = await db.query('SELECT grade_id FROM sections WHERE id = ?', [section_id]);
        if (!gradeRows || gradeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }
        const grade_id = gradeRows[0].grade_id;

        const [existing] = await db.query(
            'SELECT id FROM subject_section_assignments WHERE subject_id = ? AND grade_id = ? AND section_id = ? AND is_active = 1',
            [subject_id, grade_id, section_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Subject already assigned to this section' });
        }

        const [insertRes] = await db.query(
            'INSERT INTO subject_section_assignments (subject_id, grade_id, section_id, is_active, created_by, created_at) VALUES (?, ?, ?, 1, ?, NOW())',
            [subject_id, grade_id, section_id, created_by]
        );
        return res.json({ success: true, message: 'Subject added to section successfully', id: insertRes.insertId });
    } catch (err) {
        console.error('Error adding subject to section:', err);
        return res.status(500).json({ success: false, message: 'Failed to add subject' });
    }
};

// Remove a subject from a section (soft delete), promise-based
exports.removeSubject = async (req, res) => {
    const { section_id, subject_id } = req.body;

    if (!section_id || !subject_id) {
        return res.status(400).json({ success: false, message: 'Section ID and Subject ID are required' });
    }
    try {
        const [gradeRows] = await db.query('SELECT grade_id FROM sections WHERE id = ?', [section_id]);
        if (!gradeRows || gradeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }
        const grade_id = gradeRows[0].grade_id;

        await db.query('DELETE FROM context_activities WHERE subject_id = ? AND grade_id = ? AND section_id = ?', [subject_id, grade_id, section_id]);
        const [result] = await db.query(
            'UPDATE subject_section_assignments SET is_active = 0 WHERE subject_id = ? AND grade_id = ? AND section_id = ?',
            [subject_id, grade_id, section_id]
        );
        return res.json({ success: true, message: 'Subject removed from section successfully' });
    } catch (err) {
        console.error('Error removing subject:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove subject' });
    }
};

// Add activity to a subject in a section (promise-based)
exports.addSubjectActivity = async (req, res) => {
    const { section_id, subject_id, activity_type } = req.body;

    if (!section_id || !subject_id || !activity_type) {
        return res.status(400).json({ success: false, message: 'Section ID, Subject ID, and Activity Type are required' });
    }
    try {
        const [gradeRows] = await db.query('SELECT grade_id FROM sections WHERE id = ?', [section_id]);
        if (!gradeRows || gradeRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }
        const grade_id = gradeRows[0].grade_id;

        const [existing] = await db.query(
            'SELECT id FROM context_activities WHERE grade_id = ? AND section_id = ? AND subject_id = ? AND activity_id = ? AND parent_context_id IS NULL',
            [grade_id, section_id, subject_id, activity_type]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Activity already assigned to this subject' });
        }

        const [insertRes] = await db.query(
            'INSERT INTO context_activities (grade_id, section_id, subject_id, activity_id, parent_context_id, created_at) VALUES (?, ?, ?, ?, NULL, NOW())',
            [grade_id, section_id, subject_id, activity_type]
        );
        return res.json({ success: true, message: 'Activity added successfully', id: insertRes.insertId });
    } catch (err) {
        console.error('Error adding subject activity:', err);
        return res.status(500).json({ success: false, message: 'Failed to add activity' });
    }
};

// Remove an activity from a subject (promise-based)
exports.removeSubjectActivity = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: 'Context Activity ID is required' });
    }
    try {
        await db.query('DELETE FROM context_activities WHERE id = ? OR parent_context_id = ?', [id, id]);
        return res.json({ success: true, message: 'Activity removed successfully' });
    } catch (err) {
        console.error('Error removing activity:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove activity' });
    }
};

// Add sub-activity to an activity (promise-based)
exports.addSubjectSubActivity = async (req, res) => {
    const { ssaID, subActivityId } = req.body;

    if (!ssaID || !subActivityId) {
        return res.status(400).json({ success: false, message: 'Parent Context Activity ID and Sub-Activity ID are required' });
    }
    try {
        const [parentRows] = await db.query('SELECT grade_id, section_id, subject_id FROM context_activities WHERE id = ?', [ssaID]);
        if (!parentRows || parentRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Parent activity not found' });
        }
        const { grade_id, section_id, subject_id } = parentRows[0];

        const [existing] = await db.query(
            'SELECT id FROM context_activities WHERE grade_id = ? AND section_id = ? AND subject_id = ? AND activity_id = ? AND parent_context_id = ?',
            [grade_id, section_id, subject_id, subActivityId, ssaID]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Sub-activity already assigned to this parent' });
        }

        const [insertRes] = await db.query(
            'INSERT INTO context_activities (grade_id, section_id, subject_id, activity_id, parent_context_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [grade_id, section_id, subject_id, subActivityId, ssaID]
        );
        return res.json({ success: true, message: 'Sub-activity added successfully', id: insertRes.insertId });
    } catch (err) {
        console.error('Error adding sub-activity:', err);
        return res.status(500).json({ success: false, message: 'Failed to add sub-activity' });
    }
};

// Remove a sub-activity (promise-based)
exports.removeSubjectSubActivity = async (req, res) => {
    const { subject_sub_activity_id } = req.body;

    if (!subject_sub_activity_id) {
        return res.status(400).json({ success: false, message: 'Sub-Activity ID is required' });
    }
    try {
        await db.query('DELETE FROM context_activities WHERE id = ?', [subject_sub_activity_id]);
        return res.json({ success: true, message: 'Sub-activity removed successfully' });
    } catch (err) {
        console.error('Error removing sub-activity:', err);
        return res.status(500).json({ success: false, message: 'Failed to remove sub-activity' });
    }
};

// Add new subjects to the system (promise-based)
exports.addSubjects = async (req, res) => {
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
    try {
        const [result] = await db.query(sql, flatValues);
        return res.json({ success: true, message: 'Subjects added successfully', insertedCount: result.affectedRows });
    } catch (err) {
        console.error('Error adding subjects:', err);
        return res.status(500).json({ success: false, message: 'Failed to add subjects' });
    }
};

// Add new activities to the system (supports any level, promise-based)
exports.addActivities = async (req, res) => {
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
    try {
        const [result] = await db.query(sql, flatValues);
        return res.json({ success: true, message: 'Activities added successfully', insertedCount: result.affectedRows });
    } catch (err) {
        console.error('Error adding activities:', err);
        return res.status(500).json({ success: false, message: 'Failed to add activities' });
    }
};

// Add new sub-activities to the system (supports any level, promise-based)
exports.addSubActivities = async (req, res) => {
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
    try {
        const [result] = await db.query(sql, flatValues);
        return res.json({ success: true, message: 'Sub-activities added successfully', insertedCount: result.affectedRows });
    } catch (err) {
        console.error('Error adding sub-activities:', err);
        return res.status(500).json({ success: false, message: 'Failed to add sub-activities' });
    }
};

module.exports = exports;
