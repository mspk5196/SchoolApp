const db = require('../../config/db');


exports.getSectionsWithMentors = (req, res) => {
    const { gradeId } = req.body;

    if (!gradeId) {
        return res.status(400).json({ success: false, message: 'Grade ID is required' });
    }

    const sql = `
        SELECT 
            s.id as section_id,
            s.section_name,
            s.grade_id,
            m.id as mentor_id,
            m.faculty_id,
            f.name as mentor_name,
            f.roll as mentor_roll,
            f.specification,
            f.profile_photo,
            COUNT(DISTINCT st.id) as student_count
        FROM sections s
        LEFT JOIN mentor_section_assignments msa ON msa.section_id = s.id AND msa.is_active = 1
        LEFT JOIN mentors m ON m.id = msa.mentor_id AND m.is_active = 1
        LEFT JOIN faculty f ON f.id = m.faculty_id
        LEFT JOIN students st ON st.id IN (
            SELECT student_id FROM student_mappings 
            WHERE section_id = s.id AND academic_year = (SELECT academic_year FROM academic_years WHERE is_active = 1)
        )
        WHERE s.grade_id = ? AND s.is_active = 1
        GROUP BY s.id, s.section_name, s.grade_id, m.id, m.faculty_id, f.name, f.roll, f.specification, f.profile_photo
        ORDER BY s.section_name`;

    db.query(sql, [gradeId], (err, results) => {
        if (err) {
            console.error('Error fetching sections with mentors:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.json({ success: true, data: results, message: 'Sections with mentors fetched successfully' });
    });
};

// Get all unassigned mentors (mentors not assigned to any section in any grade)
exports.getUnassignedMentors = (req, res) => {
    const sql = `
        SELECT 
            m.id as mentor_id,
            m.faculty_id,
            f.name as mentor_name,
            f.roll as mentor_roll,
            f.email,
            f.phone,
            f.specification,
            f.profile_photo
        FROM mentors m
        JOIN faculty f ON f.id = m.faculty_id
        WHERE m.is_active = 1
        AND m.id NOT IN (
            SELECT mentor_id 
            FROM mentor_section_assignments 
            WHERE is_active = 1
        )
        ORDER BY f.name`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching unassigned mentors:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.json({ success: true, data: results });
    });
};

// Assign mentor to section
exports.assignMentorToSection = (req, res) => {
    const { mentorId, sectionId, assignedBy } = req.body;

    if (!mentorId || !sectionId) {
        return res.status(400).json({ success: false, message: 'Mentor ID and Section ID are required' });
    }

    // Check if mentor is already assigned to another section
    const checkSql = `
        SELECT msa.id, s.section_name, g.grade_name
        FROM mentor_section_assignments msa
        JOIN sections s ON s.id = msa.section_id
        JOIN grades g ON g.id = s.grade_id
        WHERE msa.mentor_id = ? AND msa.is_active = 1`;

    db.query(checkSql, [mentorId], (err, results) => {
        if (err) {
            console.error('Error checking mentor assignment:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (results.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Mentor is already assigned to ${results[0].grade_name} - ${results[0].section_name}`
            });
        }

        // Check if section already has a mentor
        const checkSectionSql = `
            SELECT msa.id 
            FROM mentor_section_assignments msa
            WHERE msa.section_id = ? AND msa.is_active = 1`;

        db.query(checkSectionSql, [sectionId], (err, sectionResults) => {
            if (err) {
                console.error('Error checking section mentor:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }

            if (sectionResults.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'This section already has a mentor assigned'
                });
            }

            // Assign mentor to section
            const insertSql = `
                INSERT INTO mentor_section_assignments (mentor_id, section_id, is_active, assigned_by, created_at)
                VALUES (?, ?, 1, ?, NOW())`;

            db.query(insertSql, [mentorId, sectionId, assignedBy], (err, result) => {
                if (err) {
                    console.error('Error assigning mentor:', err);
                    return res.status(500).json({ success: false, message: 'Internal Server Error' });
                }

                res.json({
                    success: true,
                    message: 'Mentor assigned to section successfully',
                    data: { assignment_id: result.insertId }
                });
            });
        });
    });
};

// Unassign mentor from section
exports.unassignMentorFromSection = (req, res) => {
    const { mentorId, sectionId } = req.body;

    if (!mentorId || !sectionId) {
        return res.status(400).json({ success: false, message: 'Mentor ID and Section ID are required' });
    }

    const sql = `
        UPDATE mentor_section_assignments 
        SET is_active = 0 
        WHERE mentor_id = ? AND section_id = ? AND is_active = 1`;

    db.query(sql, [mentorId, sectionId], (err, result) => {
        if (err) {
            console.error('Error unassigning mentor:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        res.json({ success: true, message: 'Mentor unassigned from section successfully' });
    });
};

// Get students by section
exports.getStudentsBySection = (req, res) => {
    const { sectionId } = req.body;

    if (!sectionId) {
        return res.status(400).json({ success: false, message: 'Section ID is required' });
    }

    const sql = `
        SELECT 
            st.id as student_id,
            st.name,
            st.roll,
            st.email,
            st.mobile,
            st.photo_url,
            sm.academic_year,
            s.section_name,
            g.grade_name
        FROM students st
        JOIN student_mappings sm ON sm.student_id = st.id
        JOIN sections s ON s.id = sm.section_id
        JOIN grades g ON g.id = s.grade_id
        WHERE sm.section_id = ? 
        AND sm.academic_year = (SELECT academic_year FROM academic_years WHERE is_active = 1)
        ORDER BY st.roll`;

    db.query(sql, [sectionId], (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        
        res.json({ success: true, data: results });
    });
};
