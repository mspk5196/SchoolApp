const db = require('../../config/db');

exports.getSectionsWithMentors = async (req, res) => {
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
            WHERE section_id = s.id AND academic_year = (SELECT ay.id FROM academic_years ay JOIN ay_status ays ON ay.id = ays.academic_year_id WHERE ays.is_active = 1)
        )
        WHERE s.grade_id = ? AND s.is_active = 1
        GROUP BY s.id, s.section_name, s.grade_id, m.id, m.faculty_id, f.name, f.roll, f.specification, f.profile_photo
        ORDER BY s.section_name`;

    try {
        const [results] = await db.query(sql, [gradeId]);
        return res.json({ success: true, data: results, message: 'Sections with mentors fetched successfully' });
    } catch (err) {
        console.error('Error fetching sections with mentors:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get all unassigned mentors (mentors not assigned to any section in any grade)
exports.getUnassignedMentors = async (req, res) => {
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

    try {
        const [results] = await db.query(sql);
        return res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching unassigned mentors:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Assign mentor to section
exports.assignMentorToSection = async (req, res) => {
    const { mentorId, sectionId, assignedBy } = req.body;

    if (!mentorId || !sectionId) {
        return res.status(400).json({ success: false, message: 'Mentor ID and Section ID are required' });
    }

    try {
        const checkSql = `
            SELECT msa.id, s.section_name, g.grade_name
            FROM mentor_section_assignments msa
            JOIN sections s ON s.id = msa.section_id
            JOIN grades g ON g.id = s.grade_id
            WHERE msa.mentor_id = ? AND msa.is_active = 1`;

        const [results] = await db.query(checkSql, [mentorId]);
        if (results.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Mentor is already assigned to ${results[0].grade_name} - ${results[0].section_name}`
            });
        }

        const checkSectionSql = `
            SELECT msa.id 
            FROM mentor_section_assignments msa
            WHERE msa.section_id = ? AND msa.is_active = 1`;

        const [sectionResults] = await db.query(checkSectionSql, [sectionId]);
        if (sectionResults.length > 0) {
            return res.status(409).json({ success: false, message: 'This section already has a mentor assigned' });
        }

        const insertSql = `
            INSERT INTO mentor_section_assignments (mentor_id, section_id, is_active, assigned_by, created_at)
            VALUES (?, ?, 1, ?, NOW())`;

        const [insertResult] = await db.query(insertSql, [mentorId, sectionId, assignedBy]);
        return res.json({ success: true, message: 'Mentor assigned to section successfully', data: { assignment_id: insertResult.insertId } });
    } catch (err) {
        console.error('Error assigning mentor:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Unassign mentor from section
exports.unassignMentorFromSection = async (req, res) => {
    const { mentorId, sectionId } = req.body;

    if (!mentorId || !sectionId) {
        return res.status(400).json({ success: false, message: 'Mentor ID and Section ID are required' });
    }

    const sql = `
        UPDATE mentor_section_assignments 
        SET is_active = 0 
        WHERE mentor_id = ? AND section_id = ? AND is_active = 1`;

    try {
        const [result] = await db.query(sql, [mentorId, sectionId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        return res.json({ success: true, message: 'Mentor unassigned from section successfully' });
    } catch (err) {
        console.error('Error unassigning mentor:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get students by section
exports.getStudentsBySection = async (req, res) => {
    const { sectionId } = req.body;

    if (!sectionId) {
        return res.status(400).json({ success: false, message: 'Section ID is required' });
    }

    const sql = `
        SELECT 
    sm.id AS student_id,
    st.name,
    st.roll,
    st.email,
    st.mobile,
    st.photo_url,
    sm.academic_year,
    s.section_name,
    g.grade_name,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'batch_id', sba.batch_id,
            'subject_id', ssa.subject_id
        )
    ) AS batch_subject_pairs

FROM students st
JOIN student_mappings sm 
      ON sm.student_id = st.id
JOIN sections s 
      ON s.id = sm.section_id
JOIN grades g 
      ON g.id = s.grade_id

LEFT JOIN student_batch_assignments sba 
       ON sba.student_id = st.id
      AND sba.academic_year = sm.academic_year

LEFT JOIN section_batches sb 
       ON sb.id = sba.batch_id

LEFT JOIN subject_section_assignments ssa 
       ON sb.subject_section_id = ssa.id
      AND ssa.section_id = sm.section_id

WHERE sm.section_id = ?
  AND sm.academic_year = (
        SELECT ay.id 
        FROM academic_years ay
        JOIN ay_status ays ON ays.academic_year_id = ay.id
        WHERE ays.is_active = 1
  )

GROUP BY sm.id
ORDER BY st.roll;
`;

    try {
        const [results] = await db.query(sql, [sectionId]);
        console.log(results[0].batch_subject_pairs);

        return res.json({ success: true, data: results });
    } catch (err) {
        console.error('Error fetching students:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get subjects available for a grade (used to build subject tabs)
exports.getMentorGradeSubject = async (req, res) => {
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

    try {
        const [results] = await db.query(sql, [gradeID]);
        return res.json({ success: true, mentorGradeSubjects: results });
    } catch (err) {
        console.error('Error fetching subjects for grade:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get mentors list for a grade (available mentors pool)
exports.getSubjectGradeMentors = async (req, res) => {
    const { gradeID } = req.body;

    // gradeID is optional here; we'll return all active mentors with faculty info
    const sql = `
        SELECT m.id as id, m.faculty_id, f.name, f.roll, f.email, f.phone, f.specification, f.profile_photo
        FROM mentors m
        JOIN faculty f ON f.id = m.faculty_id
        LEFT JOIN mentor_grade_assignments mga ON mga.mentor_id = m.id AND mga.grade_id = ?
        WHERE m.is_active = 1
        ORDER BY f.name`;

    try {
        const [results] = await db.query(sql, [gradeID]);
        return res.json({ success: true, gradeMentor: results });
    } catch (err) {
        console.error('Error fetching mentors for grade:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get mentors enrolled for a specific grade + subject (promise-based)
exports.getEnroledSubjectMentors = async (req, res) => {
    const { gradeID, subjectID } = req.body;
    if (!gradeID || !subjectID) {
        return res.status(400).json({ success: false, message: 'Grade ID and Subject ID are required' });
    }

    const primarySql = `
        SELECT fssa.id as id, m.id as mentor_id, f.id as faculty_id, f.name, f.roll, f.specification, f.profile_photo
        FROM faculty_section_subject_assignments fssa
        JOIN faculty_subject_assignments fsa ON fsa.id = fssa.fsa_id AND fsa.is_active = 1
        JOIN subject_section_assignments ssa ON ssa.id = fssa.ssa_id AND ssa.is_active = 1
        JOIN mentors m ON m.faculty_id = fsa.faculty_id
        JOIN faculty f ON f.id = m.faculty_id
        WHERE ssa.grade_id = ? AND ssa.subject_id = ? AND fssa.is_active = 1
        GROUP BY fssa.id, m.id, f.id, f.name, f.roll, f.specification, f.profile_photo
        ORDER BY f.name`;

    try {
        const [primaryRows] = await db.query(primarySql, [gradeID, subjectID]);
        if (primaryRows && primaryRows.length > 0) {
            return res.json({ success: true, gradeEnroledMentor: primaryRows });
        }

        const fallbackSql = `
            SELECT fsa.id as fsa_id, m.id as mentor_id, f.id as faculty_id, f.name, f.roll, f.specification, f.profile_photo
            FROM faculty_subject_assignments fsa
            JOIN mentors m ON m.faculty_id = fsa.faculty_id
            JOIN faculty f ON f.id = m.faculty_id
            WHERE fsa.subject_id = ? AND fsa.is_active = 1
            ORDER BY f.name`;
        const [fallbackRows] = await db.query(fallbackSql, [subjectID]);
        return res.json({ success: true, gradeEnroledMentor: fallbackRows || [] });
    } catch (err) {
        console.error('Error fetching enrolled subject mentors:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Assign mentor to a subject for a grade (promise-based)
exports.assignMentorToSubject = async (req, res) => {
    const { mentor_id, subject_id, grade_id, created_by } = req.body;
    if (!mentor_id || !subject_id || !grade_id) {
        return res.status(400).json({ success: false, message: 'mentor_id, subject_id and grade_id are required' });
    }

    try {
        // Resolve faculty_id from mentor
        const [mentorRows] = await db.query('SELECT faculty_id FROM mentors WHERE id = ? AND is_active = 1', [mentor_id]);
        if (!mentorRows || mentorRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found or inactive' });
        }
        const facultyId = mentorRows[0].faculty_id;

        // Ensure faculty_subject_assignments exists
        let fsaId;
        const [existingFsa] = await db.query('SELECT id FROM faculty_subject_assignments WHERE faculty_id = ? AND subject_id = ? LIMIT 1', [facultyId, subject_id]);
        if (existingFsa.length > 0) {
            fsaId = existingFsa[0].id;
        } else {
            const [insertFsa] = await db.query(
                'INSERT INTO faculty_subject_assignments (faculty_id, subject_id, is_active, created_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                [facultyId, subject_id, created_by || null]
            );
            fsaId = insertFsa.insertId;
        }

        // Fetch section-level subject assignments for grade+subject
        const [ssaRows] = await db.query(
            'SELECT id FROM subject_section_assignments WHERE grade_id = ? AND subject_id = ? AND is_active = 1',
            [grade_id, subject_id]
        );

        if (!ssaRows || ssaRows.length === 0) {
            return res.json({ success: true, message: 'Mentor linked to subject (no section mappings found for grade)', data: { fsa_id: fsaId } });
        }

        const linkResults = [];
        for (const ssa of ssaRows) {
            const [existingLink] = await db.query(
                'SELECT id FROM faculty_section_subject_assignments WHERE fsa_id = ? AND ssa_id = ? LIMIT 1',
                [fsaId, ssa.id]
            );
            if (existingLink.length > 0) {
                linkResults.push({ existed: true, id: existingLink[0].id });
                continue;
            }
            const [newLink] = await db.query(
                'INSERT INTO faculty_section_subject_assignments (fsa_id, ssa_id, is_active, created_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                [fsaId, ssa.id, created_by || null]
            );
            linkResults.push({ existed: false, id: newLink.insertId });
        }

        return res.json({ success: true, message: 'Mentor assigned to subject for grade successfully', data: { fsa_id: fsaId, links: linkResults } });
    } catch (err) {
        console.error('Error assigning mentor to subject:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Remove enrolled subject-mentor mapping (soft-delete, promise-based)
exports.removeEnroledSubjectMentor = async (req, res) => {
    const { msaID } = req.body;
    if (!msaID) {
        return res.status(400).json({ success: false, message: 'Mapping ID (msaID) is required' });
    }
    try {
        const [result] = await db.query('UPDATE faculty_section_subject_assignments SET is_active = 0 WHERE id = ? AND is_active = 1', [msaID]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mapping not found or already removed' });
        }
        return res.json({ success: true, message: 'Mentor removed from subject successfully' });
    } catch (err) {
        console.error('Error removing enrolled subject mentor:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get mentors for a specific grade with details
exports.getGradeMentors = async (req, res) => {
    const { gradeID } = req.body;

    if (!gradeID) {
        return res.status(400).json({ success: false, message: 'Grade ID is required' });
    }

    try {
        const sql = `
            SELECT DISTINCT
                m.id,
                m.faculty_id,
                f.name,
                f.roll,
                f.email,
                f.phone,
                f.specification,
                f.profile_photo as photo_url,
                GROUP_CONCAT(DISTINCT s.section_name ORDER BY s.section_name SEPARATOR ', ') as sections,
                COUNT(DISTINCT sm.student_id) as student_count
            FROM mentors m
            JOIN faculty f ON f.id = m.faculty_id
            LEFT JOIN mentor_section_assignments msa ON msa.mentor_id = m.id AND msa.is_active = 1
            LEFT JOIN sections s ON s.id = msa.section_id AND s.grade_id = ? AND s.is_active = 1
            LEFT JOIN student_mappings sm ON sm.section_id = s.id 
                AND sm.academic_year = (
                    SELECT ay.id FROM academic_years ay 
                    JOIN ay_status ays ON ay.id = ays.academic_year_id 
                    WHERE ays.is_active = 1
                )
            WHERE m.is_active = 1
            AND EXISTS (
                SELECT 1 FROM mentor_section_assignments msa2
                JOIN sections s2 ON s2.id = msa2.section_id
                WHERE msa2.mentor_id = m.id 
                AND s2.grade_id = ? 
                AND msa2.is_active = 1
            )
            GROUP BY m.id, m.faculty_id, f.name, f.roll, f.email, f.phone, f.specification, f.profile_photo
            ORDER BY f.name`;

        const [mentors] = await db.query(sql, [gradeID, gradeID]);
        
        return res.json({ 
            success: true, 
            gradeMentors: mentors,
            message: 'Grade mentors fetched successfully' 
        });
    } catch (err) {
        console.error('Error fetching grade mentors:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get mentor schedule for a specific date
exports.getMentorSchedule = async (req, res) => {
    const { mentorId, date } = req.body;

    if (!mentorId || !date) {
        return res.status(400).json({ success: false, message: 'Mentor ID and date are required' });
    }

    try {
        const sql = `
            SELECT 
                fc.id,
                fc.date,
                fc.start_time,
                fc.end_time,
                fc.acting_role,
                fc.status,
                fc.task_description,
                fc.total_marks,
                g.grade_name,
                s.section_name,
                sub.subject_name,
                v.name as venue_name,
                st.name as session_type,
                th.topic_name,
                ca.id as context_activity_id,
                a.name as activity_name,
                GROUP_CONCAT(DISTINCT sb.batch_name ORDER BY sb.batch_name SEPARATOR ', ') as batch_names
            FROM faculty_calendar fc
            JOIN mentors m ON m.faculty_id = fc.faculty_id
            LEFT JOIN grades g ON g.id = fc.grade_id
            LEFT JOIN sections s ON s.id = fc.section_id
            LEFT JOIN subjects sub ON sub.id = fc.subject_id
            LEFT JOIN venues v ON v.id = fc.venue_id
            LEFT JOIN session_types st ON st.id = fc.session_type_id
            LEFT JOIN topic_hierarchy th ON th.id = fc.topic_id
            LEFT JOIN context_activities ca ON ca.id = fc.context_activity_id
            LEFT JOIN activities a ON a.id = ca.activity_id
            LEFT JOIN session_batches sesb ON sesb.faculty_calendar_id = fc.id
            LEFT JOIN section_batches sb ON sb.id = sesb.batch_id
            WHERE m.id = ? 
            AND fc.date = ?
            AND fc.status != 'cancelled'
            GROUP BY fc.id
            ORDER BY fc.start_time`;

        const [schedule] = await db.query(sql, [mentorId, date]);
        // console.log(schedule);
        
        return res.json({ 
            success: true, 
            schedule: schedule,
            message: 'Mentor schedule fetched successfully' 
        });
    } catch (err) {
        console.error('Error fetching mentor schedule:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get mentor details including subjects, grades, attendance
exports.getMentorDetails = async (req, res) => {
    const { mentorId } = req.body;

    if (!mentorId) {
        return res.status(400).json({ success: false, message: 'Mentor ID is required' });
    }

    try {
        const academicYearSql = `
            SELECT ay.id FROM academic_years ay 
            JOIN ay_status ays ON ay.id = ays.academic_year_id 
            WHERE ays.is_active = 1`;
        const [ayResult] = await db.query(academicYearSql);
        const academicYearId = ayResult[0]?.id;

        // Get subjects taught by mentor
        const subjectsSql = `
            SELECT DISTINCT sub.subject_name
            FROM faculty_section_subject_assignments fssa
            JOIN faculty_subject_assignments fsa ON fsa.id = fssa.fsa_id
            JOIN subjects sub ON sub.id = fsa.subject_id
            JOIN mentors m ON m.faculty_id = fsa.faculty_id
            WHERE m.id = ? AND fssa.is_active = 1 AND fsa.is_active = 1
            ORDER BY sub.subject_name`;
        const [subjects] = await db.query(subjectsSql, [mentorId]);

        // Get grades and sections assigned to mentor
        const gradesSql = `
            SELECT DISTINCT g.grade_name, s.section_name
            FROM mentor_section_assignments msa
            JOIN sections s ON s.id = msa.section_id
            JOIN grades g ON g.id = s.grade_id
            WHERE msa.mentor_id = ? AND msa.is_active = 1
            ORDER BY g.grade_name, s.section_name`;
        const [gradesData] = await db.query(gradesSql, [mentorId]);

        // Get attendance data
        const attendanceSql = `
            SELECT 
                fa.total_days,
                fa.present_days,
                fa.leave_days,
                ROUND((fa.present_days / NULLIF(fa.total_days, 0)) * 100, 2) as attendance_percentage
            FROM faculty_attendence fa
            JOIN mentors m ON m.faculty_id = fa.faculty_id
            WHERE m.id = ? AND fa.academic_year = ?`;
        const [attendance] = await db.query(attendanceSql, [mentorId, academicYearId]);
        console.log('details:', {
                subjects: subjects.map(s => s.subject_name),
                grades: gradesData.map(g => g.grade_name),
                sections: gradesData.map(g => g.section_name).filter((v, i, a) => a.indexOf(v) === i),
                attendance: attendance[0] || {
                    total_days: 0,
                    present_days: 0,
                    leave_days: 0,
                    attendance_percentage: 0
                }
            });
        
        return res.json({
            success: true,
            details: {
                subjects: subjects.map(s => s.subject_name),
                grades: gradesData.map(g => g.grade_name),
                sections: gradesData.map(g => g.section_name).filter((v, i, a) => a.indexOf(v) === i),
                attendance: attendance[0] || {
                    total_days: 0,
                    present_days: 0,
                    leave_days: 0,
                    attendance_percentage: 0
                }
            },
            message: 'Mentor details fetched successfully'
        });
    } catch (err) {
        console.error('Error fetching mentor details:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get faculty issues
exports.getFacultyIssues = async (req, res) => {
    const { gradeId, registeredBy } = req.body;

    if (!gradeId) {
        return res.status(400).json({ success: false, message: 'Grade ID is required' });
    }

    try {
        let sql = `
            SELECT 
                fil.id,
                fil.faculty_id,
                fil.complaint,
                fil.registered_at,
                f1.name as faculty_name,
                f1.roll as faculty_roll,
                f1.specification,
                f1.phone,
                f2.name as registered_by_name,
                f2.roll as registered_by_roll
            FROM faculty_issue_log fil
            LEFT JOIN faculty f1 ON f1.id = fil.faculty_id
            LEFT JOIN faculty f2 ON f2.id = fil.registered_by
            LEFT JOIN mentors m ON m.faculty_id = fil.faculty_id
            LEFT JOIN mentor_section_assignments msa ON msa.mentor_id = m.id AND msa.is_active = 1
            LEFT JOIN sections s ON s.id = msa.section_id
            WHERE s.grade_id = ?`;
        
        const params = [gradeId];
        
        if (registeredBy) {
            sql += ' AND fil.registered_by = ?';
            params.push(registeredBy);
        }
        
        sql += ' ORDER BY fil.registered_at DESC';

        const [issues] = await db.query(sql, params);

        return res.json({
            success: true,
            issues: issues,
            count: issues.length
        });
    } catch (err) {
        console.error('Error fetching faculty issues:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Create faculty issue
exports.createFacultyIssue = async (req, res) => {
    const { facultyId, complaint, registeredBy } = req.body;
    console.log(req.body);
    
    if (!facultyId || !complaint) {
        return res.status(400).json({ success: false, message: 'Faculty ID and complaint are required' });
    }

    try {
        const sql = `
            INSERT INTO faculty_issue_log (faculty_id, complaint, registered_by, registered_at)
            VALUES (?, ?, ?, NOW())`;

        const [result] = await db.query(sql, [facultyId, complaint, registeredBy]);
        console.log(result);
        
        return res.json({
            success: true,
            message: 'Issue registered successfully',
            issueId: result.insertId
        });
    } catch (err) {
        console.error('Error creating faculty issue:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get faculty issue count
exports.getFacultyIssueCount = async (req, res) => {
    const { facultyId } = req.body;

    if (!facultyId) {
        return res.status(400).json({ success: false, message: 'Faculty ID is required' });
    }

    try {
        const sql = 'SELECT COUNT(*) as count FROM faculty_issue_log WHERE faculty_id = ?';
        const [result] = await db.query(sql, [facultyId]);

        return res.json({
            success: true,
            count: result[0].count
        });
    } catch (err) {
        console.error('Error fetching issue count:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Get mentors list for grade (for issue log faculty selection)
exports.getGradeMentorsForIssues = async (req, res) => {
    const { gradeId } = req.body;

    if (!gradeId) {
        return res.status(400).json({ success: false, message: 'Grade ID is required' });
    }

    try {
        const sql = `
            SELECT DISTINCT
                m.id as mentor_id,
                m.faculty_id,
                f.name as faculty_name,
                f.roll as faculty_roll,
                f.specification,
                f.profile_photo,
                s.section_name
            FROM mentors m
            JOIN faculty f ON f.id = m.faculty_id
            JOIN mentor_section_assignments msa ON msa.mentor_id = m.id AND msa.is_active = 1
            JOIN sections s ON s.id = msa.section_id
            WHERE s.grade_id = ? AND m.is_active = 1
            ORDER BY f.name`;

        const [mentors] = await db.query(sql, [gradeId]);

        return res.json({
            success: true,
            mentors: mentors
        });
    } catch (err) {
        console.error('Error fetching mentors for issues:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
