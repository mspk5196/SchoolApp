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
        AND sm.academic_year = (SELECT id FROM academic_years WHERE is_active = 1)
        ORDER BY st.roll`;

    db.query(sql, [sectionId], (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        
        res.json({ success: true, data: results });
    });
};

// Get subjects available for a grade (used to build subject tabs)
exports.getMentorGradeSubject = (req, res) => {
    const { gradeID } = req.body;

    if (!gradeID) {
        return res.status(400).json({ success: false, message: 'Grade ID is required' });
    }

    const sql = `
        SELECT DISTINCT ssa.subject_id, sub.subject_name
        FROM subject_section_assignments ssa
        JOIN subjects sub ON sub.id = ssa.subject_id
        WHERE ssa.grade_id = ? AND ssa.is_active = 1
        ORDER BY sub.subject_name`;

    db.query(sql, [gradeID], (err, results) => {
        if (err) {
            console.error('Error fetching subjects for grade:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.json({ success: true, mentorGradeSubjects: results });
    });
};

// Get mentors list for a grade (available mentors pool)
exports.getSubjectGradeMentors = (req, res) => {
    const { gradeID } = req.body;

    // gradeID is optional here; we'll return all active mentors with faculty info
    const sql = `
        SELECT m.id as id, m.faculty_id, f.name, f.roll, f.email, f.phone, f.specification, f.profile_photo
        FROM mentors m
        JOIN faculty f ON f.id = m.faculty_id
        WHERE m.is_active = 1
        ORDER BY f.name`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching mentors for grade:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.json({ success: true, gradeMentor: results });
    });
};

// Get mentors enrolled for a specific grade + subject
exports.getEnroledSubjectMentors = (req, res) => {
    const { gradeID, subjectID } = req.body;

    if (!gradeID || !subjectID) {
        return res.status(400).json({ success: false, message: 'Grade ID and Subject ID are required' });
    }

    // Primary: use faculty_section_subject_assignments linking faculty_subject_assignments -> subject_section_assignments
    const sql = `
        SELECT fssa.id as id, m.id as mentor_id, f.id as faculty_id, f.name, f.roll, f.specification, f.profile_photo
        FROM faculty_section_subject_assignments fssa
        JOIN faculty_subject_assignments fsa ON fsa.id = fssa.fsa_id AND fsa.is_active = 1
        JOIN subject_section_assignments ssa ON ssa.id = fssa.ssa_id AND ssa.is_active = 1
        JOIN mentors m ON m.faculty_id = fsa.faculty_id
        JOIN faculty f ON f.id = m.faculty_id
        WHERE ssa.grade_id = ? AND ssa.subject_id = ? AND fssa.is_active = 1
        GROUP BY fssa.id, m.id, f.id, f.name, f.roll, f.specification, f.profile_photo
        ORDER BY f.name`;

    db.query(sql, [gradeID, subjectID], (err, results) => {
        if (err) {
            console.error('Error fetching enrolled subject mentors (by fssa):', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        if (results && results.length > 0) {
            return res.json({ success: true, gradeEnroledMentor: results });
        }

        // Fallback: find faculty_subject_assignments directly for the subject (grade-agnostic)
        const fallbackSql = `
            SELECT fsa.id as fsa_id, m.id as mentor_id, f.id as faculty_id, f.name, f.roll, f.specification, f.profile_photo
            FROM faculty_subject_assignments fsa
            JOIN mentors m ON m.faculty_id = fsa.faculty_id
            JOIN faculty f ON f.id = m.faculty_id
            WHERE fsa.subject_id = ? AND fsa.is_active = 1
            ORDER BY f.name`;

        db.query(fallbackSql, [subjectID], (fbErr, fbResults) => {
            if (fbErr) {
                console.error('Error fetching enrolled subject mentors (fallback):', fbErr);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
            return res.json({ success: true, gradeEnroledMentor: fbResults || [] });
        });
    });
};

// Assign mentor to a subject for a grade (creates/uses faculty_subject_assignments and faculty_section_subject_assignments)
exports.assignMentorToSubject = (req, res) => {
    const { mentor_id, subject_id, grade_id, created_by } = req.body;

    if (!mentor_id || !subject_id || !grade_id) {
        return res.status(400).json({ success: false, message: 'mentor_id, subject_id and grade_id are required' });
    }

    // Resolve faculty_id from mentor
    db.query('SELECT faculty_id FROM mentors WHERE id = ? AND is_active = 1', [mentor_id], (err, mentorRows) => {
        if (err) {
            console.error('Error resolving mentor:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        if (!mentorRows || mentorRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found or inactive' });
        }

        const facultyId = mentorRows[0].faculty_id;

        // Ensure faculty_subject_assignments exists
        db.query('SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject_id = ? LIMIT 1', [facultyId, subject_id], (fErr, fRows) => {
            if (fErr) {
                console.error('Error checking faculty_subject_assignments:', fErr);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }

            const createFsa = (callback) => {
                db.query('INSERT INTO faculty_subject_assignments (faculty_id, subject_id, is_active, created_by, created_at) VALUES (?, ?, 1, ?, NOW())', [facultyId, subject_id, created_by || null], (insErr, insRes) => {
                    if (insErr) return callback(insErr);
                    return callback(null, insRes.insertId);
                });
            };

            const ensureFsa = () => {
                if (fRows && fRows.length > 0) {
                    return Promise.resolve(fRows[0].id);
                }
                return new Promise((resolve, reject) => {
                    createFsa((cErr, id) => {
                        if (cErr) return reject(cErr);
                        resolve(id);
                    });
                });
            };

            ensureFsa()
            .then(fsaId => {
                // Find subject_section_assignments for this grade+subject
                db.query('SELECT id FROM subject_section_assignments WHERE grade_id = ? AND subject_id = ? AND is_active = 1', [grade_id, subject_id], (ssaErr, ssaRows) => {
                    if (ssaErr) {
                        console.error('Error finding subject_section_assignments:', ssaErr);
                        return res.status(500).json({ success: false, message: 'Internal Server Error' });
                    }

                    if (!ssaRows || ssaRows.length === 0) {
                        // If no subject-section entries exist for this grade, still return success (we created faculty_subject_assignments)
                        return res.json({ success: true, message: 'Mentor linked to subject (grade mapping not found to create section-level links)', data: { fsa_id: fsaId } });
                    }

                    // Insert faculty_section_subject_assignments for each ssa id (avoid duplicates)
                    const tasks = ssaRows.map(s => {
                        return new Promise((resolve, reject) => {
                            db.query('SELECT id FROM faculty_section_subject_assignments WHERE fsa_id = ? AND ssa_id = ? LIMIT 1', [fsaId, s.id], (checkErr, checkRows) => {
                                if (checkErr) return reject(checkErr);
                                if (checkRows && checkRows.length > 0) return resolve({ existed: true, id: checkRows[0].id });
                                db.query('INSERT INTO faculty_section_subject_assignments (fsa_id, ssa_id, is_active, created_by, created_at) VALUES (?, ?, 1, ?, NOW())', [fsaId, s.id, created_by || null], (insErr, insRes) => {
                                    if (insErr) return reject(insErr);
                                    return resolve({ existed: false, id: insRes.insertId });
                                });
                            });
                        });
                    });

                    Promise.all(tasks)
                    .then(results => {
                        return res.json({ success: true, message: 'Mentor assigned to subject for grade successfully', data: { fsa_id: fsaId, links: results } });
                    })
                    .catch(linkErr => {
                        console.error('Error creating faculty_section_subject_assignments:', linkErr);
                        return res.status(500).json({ success: false, message: 'Internal Server Error' });
                    });
                });
            })
            .catch(e => {
                console.error('Error ensuring faculty_subject_assignments:', e);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            });
        });
    });
};

// Remove enrolled subject-mentor mapping (soft-delete)
exports.removeEnroledSubjectMentor = (req, res) => {
    const { msaID } = req.body;

    if (!msaID) {
        return res.status(400).json({ success: false, message: 'Mapping ID (msaID) is required' });
    }

    const sql = 'UPDATE faculty_section_subject_assignments SET is_active = 0 WHERE id = ? AND is_active = 1';
    db.query(sql, [msaID], (err, result) => {
        if (err) {
            console.error('Error removing enrolled subject mentor:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mapping not found or already removed' });
        }
        res.json({ success: true, message: 'Mentor removed from subject successfully' });
    });
};
