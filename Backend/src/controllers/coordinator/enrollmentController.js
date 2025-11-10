const bcrypt = require('bcrypt');
const db = require('../../config/db');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Single faculty enrollment
exports.enrollFaculty = async (req, res) => {
    try {
        const { name, dob, roll, gender, mobileNumber, email, profilePhoto, role, specification, grades, sections } = req.body;

        // Validation
        if (!name || !dob || !roll || !gender || !mobileNumber || !email || !profilePhoto || !role) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        const conn = await db.promise().getConnection();
        await conn.beginTransaction();

        try {
            // Check if user exists
            const [existingUsers] = await conn.query('SELECT id FROM users WHERE phone = ?', [mobileNumber]);
            let userId;

            if (existingUsers.length > 0) {
                userId = existingUsers[0].id;
                // Update user roles if needed
                const [userRoles] = await conn.query('SELECT role_id FROM user_roles WHERE user_id = ?', [userId]);
                const existingRoleIds = userRoles.map(r => r.role_id);
                
                // Get role ID for the new role
                const [roleData] = await conn.query('SELECT id FROM roles WHERE role = ?', [role]);
                if (roleData.length > 0 && !existingRoleIds.includes(roleData[0].id)) {
                    await conn.query('INSERT INTO user_roles (user_id, role_id, is_active) VALUES (?, ?, 1)', [userId, roleData[0].id]);
                }
            } else {
                // Create new user
                const hashedPassword = await bcrypt.hash(dob, 12);
                const [userResult] = await conn.query(
                    'INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
                    [name, email, mobileNumber, hashedPassword]
                );
                userId = userResult.insertId;

                // Assign role
                const [roleData] = await conn.query('SELECT id FROM roles WHERE role = ?', [role]);
                if (roleData.length > 0) {
                    await conn.query('INSERT INTO user_roles (user_id, role_id, is_active) VALUES (?, ?, 1)', [userId, roleData[0].id]);
                }
            }

            // Check if faculty already exists
            const [existingFaculty] = await conn.query('SELECT id FROM faculty WHERE roll = ? OR phone = ?', [roll, mobileNumber]);
            let facultyId;

            if (existingFaculty.length > 0) {
                facultyId = existingFaculty[0].id;
                // Update faculty details
                await conn.query(
                    'UPDATE faculty SET user_id = ?, name = ?, dob = ?, email = ?, phone = ?, specification = ?, profile_photo = ?, updated_at = NOW() WHERE id = ?',
                    [userId, name, dob, email, mobileNumber, specification || '', profilePhoto, facultyId]
                );
            } else {
                // Create faculty record
                const [facultyResult] = await conn.query(
                    'INSERT INTO faculty (user_id, roll, name, dob, email, phone, specification, profile_photo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                    [userId, roll, name, dob, email, mobileNumber, specification || '', profilePhoto]
                );
                facultyId = facultyResult.insertId;

                // Initialize attendance record
                await conn.query(
                    'INSERT INTO faculty_attendence (faculty_id, total_days, present_days, leave_days, on_duty, academic_year, created_at) VALUES (?, 0, 0, 0, 0, YEAR(NOW()), NOW())',
                    [facultyId]
                );
            }

            // Handle role-specific assignments
            if (role === 'Coordinator') {
                // Check if coordinator record exists
                const [existingCoord] = await conn.query('SELECT id FROM coordinators WHERE faculty_id = ?', [facultyId]);
                let coordinatorId;

                if (existingCoord.length > 0) {
                    coordinatorId = existingCoord[0].id;
                } else {
                    const [coordResult] = await conn.query(
                        'INSERT INTO coordinators (faculty_id, is_active, assigned_by, created_at) VALUES (?, 1, ?, NOW())',
                        [facultyId, userId]
                    );
                    coordinatorId = coordResult.insertId;
                }

                // Assign grades if provided
                if (grades && Array.isArray(grades) && grades.length > 0) {
                    for (const gradeId of grades) {
                        await conn.query(
                            'INSERT IGNORE INTO coordinator_grade_assignments (coordinator_id, grade_id, is_active, assigned_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                            [coordinatorId, gradeId, userId]
                        );
                    }
                }
            } else if (role === 'Mentor') {
                // Check if mentor record exists
                const [existingMentor] = await conn.query('SELECT id FROM mentors WHERE faculty_id = ?', [facultyId]);
                let mentorId;

                if (existingMentor.length > 0) {
                    mentorId = existingMentor[0].id;
                } else {
                    const [mentorResult] = await conn.query(
                        'INSERT INTO mentors (faculty_id, assigned_by, is_active, created_at) VALUES (?, ?, 1, NOW())',
                        [facultyId, userId]
                    );
                    mentorId = mentorResult.insertId;
                }

                // Assign sections if provided
                if (sections && Array.isArray(sections) && sections.length > 0) {
                    for (const sectionId of sections) {
                        await conn.query(
                            'INSERT IGNORE INTO mentor_section_assignments (mentor_id, section_id, is_active, assigned_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                            [mentorId, sectionId, userId]
                        );
                    }
                }
            }

            await conn.commit();
            res.json({ success: true, message: 'Faculty enrolled successfully', facultyId, roll });

        } catch (err) {
            await conn.rollback();
            console.error('DB Error:', err);
            res.status(500).json({ success: false, message: 'Database error: ' + err.message });
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};


// Generate Excel template for bulk faculty enrollment
exports.generateFacultyEnrollTemplate = async (req, res) => {
    try {
        console.log("generating...");
        
        const workbook = new ExcelJS.Workbook();

        // Instructions sheet
        const info = workbook.addWorksheet('Instructions');
        info.getCell('A1').value = 'Faculty Bulk Enrollment Template';
        info.getCell('A1').font = { bold: true, size: 14 };
        info.getCell('A3').value = 'Instructions:';
        info.getCell('A3').font = { bold: true };
        info.getCell('A4').value = '- Fill in all required fields: Name, DOB, Roll, Gender, MobileNumber, Email, ProfilePhotoURL, Role';
        info.getCell('A5').value = '- DOB format: YYYY-MM-DD (e.g., 1990-05-21)';
        info.getCell('A6').value = '- Gender: Male, Female, Other';
        info.getCell('A7').value = '- Roll: Unique identifier (e.g., FAC001, FAC002)';
        info.getCell('A8').value = '- Role: Coordinator or Mentor';
        info.getCell('A9').value = '- Grades (for Coordinator): comma-separated grade IDs or names (e.g., 1,2,3 or Grade 1,Grade 2)';
        info.getCell('A10').value = '- Sections (for Mentor): comma-separated section IDs (e.g., 1,2,3)';
        info.getCell('A11').value = '- Leave Grades and Sections empty if not applicable';

        // Fetch grades for reference
        const [gradesData] = await db.promise().query('SELECT id, grade_name FROM grades ORDER BY id');
        if (gradesData.length > 0) {
            info.getCell('A13').value = 'Available Grades:';
            info.getCell('A13').font = { bold: true };
            let row = 14;
            gradesData.forEach(g => {
                info.getCell(`A${row}`).value = `ID: ${g.id}, Name: ${g.grade_name}`;
                row++;
            });
        }

        // Fetch sections for reference
        const [sectionsData] = await db.promise().query('SELECT s.id, s.section_name, g.grade_name FROM sections s LEFT JOIN grades g ON s.grade_id = g.id ORDER BY s.id');
        if (sectionsData.length > 0) {
            info.getCell('C13').value = 'Available Sections:';
            info.getCell('C13').font = { bold: true };
            let row = 14;
            sectionsData.forEach(s => {
                info.getCell(`C${row}`).value = `ID: ${s.id}, Section: ${s.section}, Grade: ${s.grade_name || 'N/A'}`;
                row++;
            });
        }

        // Data sheet
        const sheet = workbook.addWorksheet('Faculty');
        sheet.columns = [
            { header: 'Name*', key: 'name', width: 25 },
            { header: 'DOB (YYYY-MM-DD)*', key: 'dob', width: 18 },
            { header: 'Roll*', key: 'roll', width: 15 },
            { header: 'Gender*', key: 'gender', width: 12 },
            { header: 'MobileNumber*', key: 'mobileNumber', width: 18 },
            { header: 'Email*', key: 'email', width: 28 },
            { header: 'Specification', key: 'specification', width: 25 },
            { header: 'ProfilePhotoURL*', key: 'profilePhoto', width: 40 },
            { header: 'Role* (Coordinator/Mentor)', key: 'role', width: 25 },
            { header: 'Grades (IDs, comma-separated)', key: 'grades', width: 30 },
            { header: 'Sections (IDs, comma-separated)', key: 'sections', width: 30 },
        ];

        // Header styling
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

        // Example rows
        sheet.addRow({
            name: 'John Doe',
            dob: '1990-01-15',
            roll: 'FAC001',
            gender: 'Male',
            mobileNumber: '9876543210',
            email: 'john.doe@example.com',
            specification: 'Computer Science',
            profilePhoto: 'https://example.com/photo.jpg',
            role: 'Coordinator',
            grades: '1,2,3',
            sections: '',
        });
        sheet.addRow({
            name: 'Jane Smith',
            dob: '1992-03-20',
            roll: 'FAC002',
            gender: 'Female',
            mobileNumber: '9876543211',
            email: 'jane.smith@example.com',
            specification: 'Mathematics',
            profilePhoto: 'https://example.com/photo2.jpg',
            role: 'Mentor',
            grades: '',
            sections: '1,2',
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="faculty_enrollment_template.xlsx"');
        console.log("File generated successfully!");
        
        return res.send(Buffer.from(buffer));
    } catch (err) {
        console.error('Template generation error:', err);
        return res.status(500).json({ success: false, message: 'Failed to generate template' });
    }
};

// Bulk upload faculty from Excel file
exports.bulkUploadFaculty = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const results = { processed: 0, succeeded: 0, failed: [] };

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const sheet = workbook.getWorksheet('Faculty') || workbook.worksheets[0];
        if (!sheet) {
            return res.status(400).json({ success: false, message: 'Invalid Excel: No worksheet found' });
        }

        // Preload grades and sections
        const [gradesRows] = await db.promise().query('SELECT id, grade_name FROM grades');
        const gradeMap = new Map();
        gradesRows.forEach(g => {
            gradeMap.set(String(g.id), g.id);
            gradeMap.set(String(g.grade_name).toLowerCase(), g.id);
        });

        const [sectionsRows] = await db.promise().query('SELECT id FROM sections');
        const sectionIds = new Set(sectionsRows.map(s => s.id));

        for (let i = 2; i <= sheet.rowCount; i++) {
            results.processed++;
            try {
                const row = sheet.getRow(i);
                const name = String(row.getCell(1).value || '').trim();
                const dobCell = row.getCell(2).value;
                const roll = String(row.getCell(3).value || '').trim();
                const gender = String(row.getCell(4).value || '').trim();
                const mobileNumber = String(row.getCell(5).value || '').trim();
                const email = String(row.getCell(6).value || '').trim();
                const specification = String(row.getCell(7).value || '').trim();
                const profilePhoto = String(row.getCell(8).value || '').trim();
                const role = String(row.getCell(9).value || '').trim();
                const gradesStr = String(row.getCell(10).value || '').trim();
                const sectionsStr = String(row.getCell(11).value || '').trim();

                if (!name || !dobCell || !roll || !gender || !email || !mobileNumber || !profilePhoto || !role) {
                    results.failed.push({ row: i, message: 'Missing required fields' });
                    continue;
                }

                if (!['Coordinator', 'Mentor'].includes(role)) {
                    results.failed.push({ row: i, message: 'Invalid role. Must be Coordinator or Mentor' });
                    continue;
                }

                // Parse DOB
                let dobFormatted;
                if (dobCell instanceof Date) {
                    const yyyy = dobCell.getFullYear();
                    const mm = String(dobCell.getMonth() + 1).padStart(2, '0');
                    const dd = String(dobCell.getDate()).padStart(2, '0');
                    dobFormatted = `${yyyy}-${mm}-${dd}`;
                } else {
                    const txt = String(dobCell).trim();
                    // rudimentary validation YYYY-MM-DD
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(txt)) {
                        results.failed.push({ row: i, message: 'Invalid DOB format (expected YYYY-MM-DD)' });
                        continue;
                    }
                    dobFormatted = txt;
                }

                // Parse grades and sections
                const gradeIds = [];
                if (gradesStr && role === 'Coordinator') {
                    const gradeTokens = gradesStr.split(',').map(s => s.trim()).filter(Boolean);
                    for (const token of gradeTokens) {
                        const id = gradeMap.get(token) || gradeMap.get(token.toLowerCase());
                        if (id) {
                            gradeIds.push(id);
                        } else {
                            results.failed.push({ row: i, message: `Unknown grade: ${token}` });
                            continue;
                        }
                    }
                }

                const sectionIdsArray = [];
                if (sectionsStr && role === 'Mentor') {
                    const sectionTokens = sectionsStr.split(',').map(s => s.trim()).filter(Boolean);
                    for (const token of sectionTokens) {
                        const sid = parseInt(token);
                        if (isNaN(sid) || !sectionIds.has(sid)) {
                            results.failed.push({ row: i, message: `Unknown section ID: ${token}` });
                            continue;
                        }
                        sectionIdsArray.push(sid);
                    }
                }

                const conn = await db.promise().getConnection();
                await conn.beginTransaction();

                try {
                    // Check/create user
                    const [existingUsers] = await conn.query('SELECT id FROM users WHERE phone = ?', [mobileNumber]);
                    let userId;

                    if (existingUsers.length > 0) {
                        userId = existingUsers[0].id;
                    } else {
                        const hashedPassword = await bcrypt.hash(dobFormatted, 12);
                        const [userResult] = await conn.query(
                            'INSERT INTO users (email, phone, password_hash, created_by) VALUES (?, ?, ?, ?)',
                            [email, mobileNumber, hashedPassword, 1]
                        );
                        userId = userResult.insertId;
                    }

                    // Assign role
                    const [roleData] = await conn.query('SELECT id FROM roles WHERE role = ?', [role]);
                    if (roleData.length > 0) {
                        await conn.query('INSERT IGNORE INTO user_roles (user_id, role_id, is_active) VALUES (?, ?, 1)', [userId, roleData[0].id]);
                    }

                    // Check/create faculty
                    const [existingFaculty] = await conn.query('SELECT id FROM faculty WHERE roll = ?', [roll]);
                    let facultyId;

                    if (existingFaculty.length > 0) {
                        facultyId = existingFaculty[0].id;
                        await conn.query(
                            'UPDATE faculty SET user_id = ?, name = ?, dob = ?, email = ?, phone = ?, specification = ?, profile_photo = ?, updated_at = NOW() WHERE id = ?',
                            [userId, name, dobFormatted, email, mobileNumber, specification || '', profilePhoto, facultyId]
                        );
                    } else {
                        const [facultyResult] = await conn.query(
                            'INSERT INTO faculty (user_id, roll, name, dob, email, phone, specification, profile_photo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                            [userId, roll, name, dobFormatted, email, mobileNumber, specification || '', profilePhoto]
                        );
                        facultyId = facultyResult.insertId;

                        await conn.query(
                            'INSERT INTO faculty_attendence (faculty_id, total_days, present_days, leave_days, on_duty, academic_year, created_at) VALUES (?, 0, 0, 0, 0, YEAR(NOW()), NOW())',
                            [facultyId]
                        );
                    }

                    // Handle coordinator/mentor assignments
                    if (role === 'Coordinator') {
                        const [existingCoord] = await conn.query('SELECT id FROM coordinators WHERE faculty_id = ?', [facultyId]);
                        let coordinatorId;

                        if (existingCoord.length > 0) {
                            coordinatorId = existingCoord[0].id;
                        } else {
                            const [coordResult] = await conn.query(
                                'INSERT INTO coordinators (faculty_id, is_active, assigned_by, created_at) VALUES (?, 1, ?, NOW())',
                                [facultyId, userId]
                            );
                            coordinatorId = coordResult.insertId;
                        }

                        for (const gid of gradeIds) {
                            await conn.query(
                                'INSERT IGNORE INTO coordinator_grade_assignments (coordinator_id, grade_id, is_active, assigned_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                                [coordinatorId, gid, userId]
                            );
                        }
                    } else if (role === 'Mentor') {
                        const [existingMentor] = await conn.query('SELECT id FROM mentors WHERE faculty_id = ?', [facultyId]);
                        let mentorId;

                        if (existingMentor.length > 0) {
                            mentorId = existingMentor[0].id;
                        } else {
                            const [mentorResult] = await conn.query(
                                'INSERT INTO mentors (faculty_id, assigned_by, is_active, created_at) VALUES (?, ?, 1, NOW())',
                                [facultyId, userId]
                            );
                            mentorId = mentorResult.insertId;
                        }

                        for (const sid of sectionIdsArray) {
                            await conn.query(
                                'INSERT IGNORE INTO mentor_section_assignments (mentor_id, section_id, is_active, assigned_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                                [mentorId, sid, userId]
                            );
                        }
                    }

                    await conn.commit();
                    conn.release();
                    results.succeeded++;
                } catch (txErr) {
                    await conn.rollback();
                    conn.release();
                    throw txErr;
                }

            } catch (rowErr) {
                console.error('Bulk row error:', rowErr);
                results.failed.push({ row: i, message: rowErr.message || 'Row processing error' });
            }
        }

        return res.json({ success: true, ...results });
    } catch (err) {
        console.error('Bulk upload error:', err);
        return res.status(500).json({ success: false, message: 'Failed to process file' });
    } finally {
        // cleanup
        try { fs.unlinkSync(filePath); } catch (_) {}
    }
};


exports.createSection = (req, res) => {
    const { gradeId, sectionName, createdBy } = req.body;

    if (!gradeId || !sectionName) {
        return res.status(400).json({ success: false, message: 'Grade ID and section name are required' });
    }

    // Check if section already exists for this grade
    const checkSql = `SELECT id FROM sections WHERE grade_id = ? AND section_name = ?`;
    
    db.query(checkSql, [gradeId, sectionName], (err, results) => {
        if (err) {
            console.error('Error checking section:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        
        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Section already exists for this grade' });
        }

        // Insert new section
        const insertSql = `INSERT INTO sections (grade_id, section_name, created_by) VALUES (?, ?, ?)`;
        
        db.query(insertSql, [gradeId, sectionName, createdBy], (err, result) => {
            if (err) {
                console.error('Error creating section:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
            
            res.json({ 
                success: true, 
                message: 'Section created successfully',
                data: { id: result.insertId, grade_id: gradeId, section_name: sectionName }
            });
        });
    });
};

exports.deleteSection = (req, res) => {
    const { sectionId } = req.body;

    if (!sectionId) {
        return res.status(400).json({ success: false, message: 'Section ID is required' });
    }

    // Check if section has any students assigned
    const checkStudentsSql = `SELECT COUNT(*) as student_count FROM student_mappings WHERE section_id = ?`;
    
    db.query(checkStudentsSql, [sectionId], (err, results) => {
        if (err) {
            console.error('Error checking students:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        
        if (results[0].student_count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete section with assigned students. Please reassign students first.' 
            });
        }

        // Delete section
        const deleteSql = `DELETE FROM sections WHERE id = ?`;
        
        db.query(deleteSql, [sectionId], (err, result) => {
            if (err) {
                console.error('Error deleting section:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Section not found' });
            }
            
            res.json({ success: true, message: 'Section deleted successfully' });
        });
    });
};

exports.getSectionsByGrade = (req, res) => {
    const { gradeId } = req.body;

    if (!gradeId) {
        return res.status(400).json({ success: false, message: 'Grade ID is required' });
    }

    const sql = `SELECT s.id as section_id, s.section_name, s.grade_id, 
                        COUNT(DISTINCT st.id) as student_count
                 FROM sections s
                 LEFT JOIN student_mappings sm ON sm.section_id = s.id
                 LEFT JOIN students st ON st.id = sm.student_id
                 WHERE s.grade_id = ?
                 GROUP BY s.id, s.section_name, s.grade_id
                 ORDER BY s.section_name`;

    db.query(sql, [gradeId], (err, results) => {
        if (err) {
            console.error('Error fetching sections by grade:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        if(results.length === 0) {
            return res.status(404).json({ success: true, message: 'No sections found for this grade' });
        }
        res.json({ success: true, message:'Success', data: results });
    });
};

// Single student enrollment
exports.enrollStudent = async (req, res) => {
    try {
        const { 
            name, 
            dob, 
            roll, 
            gender, 
            mobileNumber, 
            email, 
            photoUrl, 
            fatherName, 
            fatherMobile,
            gradeId,
            sectionId,
            academicYear 
        } = req.body;

        // Validation
        if (!name || !dob || !roll || !gender || !mobileNumber || !email || !photoUrl || !fatherName || !fatherMobile || !gradeId || !sectionId || !academicYear) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }

        const conn = await db.promise().getConnection();
        await conn.beginTransaction();

        try {
            // Check if user exists
            const [existingUsers] = await conn.query('SELECT id FROM users WHERE phone = ?', [mobileNumber]);
            let userId;

            if (existingUsers.length > 0) {
                userId = existingUsers[0].id;
                // Update user roles if needed
                const [roleData] = await conn.query('SELECT id FROM roles WHERE role = ?', ['Student']);
                if (roleData.length > 0) {
                    const [existingRole] = await conn.query(
                        'SELECT id FROM user_roles WHERE user_id = ? AND role_id = ?', 
                        [userId, roleData[0].id]
                    );
                    if (existingRole.length === 0) {
                        await conn.query(
                            'INSERT INTO user_roles (user_id, role_id, is_active) VALUES (?, ?, 1)', 
                            [userId, roleData[0].id]
                        );
                    }
                }
            } else {
                // Create new user
                const hashedPassword = await bcrypt.hash(dob, 12);
                const [userResult] = await conn.query(
                    'INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)',
                    [email, mobileNumber, hashedPassword]
                );
                userId = userResult.insertId;

                // Assign Parent role
                const [roleData] = await conn.query('SELECT id FROM roles WHERE role = ?', ['Parent']);
                if (roleData.length > 0) {
                    await conn.query(
                        'INSERT INTO user_roles (user_id, role_id, is_active) VALUES (?, ?, 1)', 
                        [userId, roleData[0].id]
                    );
                }
            }

            // Check if student already exists
            const [existingStudent] = await conn.query(
                'SELECT id FROM students WHERE roll = ? OR mobile = ?', 
                [roll, mobileNumber]
            );
            let studentId;

            if (existingStudent.length > 0) {
                studentId = existingStudent[0].id;
                // Update student details
                await conn.query(
                    `UPDATE students SET 
                        user_id = ?, 
                        name = ?, 
                        dob = ?, 
                        email = ?, 
                        mobile = ?, 
                        father_name = ?, 
                        father_phone = ?, 
                        photo_url = ?, 
                        updated_at = NOW() 
                    WHERE id = ?`,
                    [userId, name, dob, email, mobileNumber, fatherName, fatherMobile, photoUrl, studentId]
                );
            } else {
                // Create student record
                const [studentResult] = await conn.query(
                    `INSERT INTO students (
                        user_id, roll, name, dob, email, mobile, 
                        father_name, father_phone, photo_url, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                    [userId, roll, name, dob, email, mobileNumber, fatherName, fatherMobile, photoUrl]
                );
                studentId = studentResult.insertId;

                // Initialize attendance record
                await conn.query(
                    `INSERT INTO student_attendence (
                        student_id, total_days, present_days, leave_days, on_duty, academic_year, created_at
                    ) VALUES (?, 0, 0, 0, 0, ?, NOW())`,
                    [studentId, academicYear]
                );
            }

            // Get mentor for the section
            const [mentorAssignment] = await conn.query(
                `SELECT mentor_id FROM mentor_section_assignments 
                WHERE section_id = ? AND is_active = 1 LIMIT 1`,
                [sectionId]
            );
            const mentorId = mentorAssignment.length > 0 ? mentorAssignment[0].mentor_id : null;

            // Check if student mapping exists for this academic year
            const [existingMapping] = await conn.query(
                `SELECT id FROM student_mappings 
                WHERE student_id = ? AND academic_year = ?`,
                [studentId, academicYear]
            );

            if (existingMapping.length > 0) {
                // Update existing mapping
                await conn.query(
                    `UPDATE student_mappings 
                    SET section_id = ?, mentor_id = ?, updated_at = NOW() 
                    WHERE student_id = ? AND academic_year = ?`,
                    [sectionId, mentorId, studentId, academicYear]
                );
            } else {
                // Create new mapping
                await conn.query(
                    `INSERT INTO student_mappings (
                        student_id, section_id, mentor_id, academic_year, created_by, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                    [studentId, sectionId, mentorId, academicYear, userId]
                );
            }

            await conn.commit();
            res.json({ 
                success: true, 
                message: "Student enrolled successfully",
                data: { studentId, userId }
            });

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }

    } catch (error) {
        console.error("Error enrolling student:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Generate student enrollment template
exports.generateStudentEnrollTemplate = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Students');

        // Define columns
        // Add an extra 'Grade-Section' dropdown column for user convenience. Keep GradeID/SectionID for bulk upload compatibility.
        // Columns: keep a human-friendly Grade-Section dropdown. Numeric GradeID/SectionID columns removed
        // because the server will resolve Grade & Section from the dropdown value during bulk upload.
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Roll', key: 'roll', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'DOB (YYYY-MM-DD)', key: 'dob', width: 18 },
            { header: 'Gender', key: 'gender', width: 12 },
            { header: 'Mobile', key: 'mobile', width: 15 },
            { header: 'FatherName', key: 'fatherName', width: 25 },
            { header: 'FatherMobile', key: 'fatherMobile', width: 15 },
            { header: 'PhotoURL', key: 'photoUrl', width: 40 },
            { header: 'Grade-Section (choose from dropdown)', key: 'gradeSection', width: 30 },
            { header: 'AcademicYear', key: 'academicYear', width: 15 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' }
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

        // Add sample row (include gradeSection example)
        worksheet.addRow({
            name: 'John Doe',
            roll: 'STU001',
            email: 'john.doe@example.com',
            dob: '2010-05-15',
            gender: 'Male',
            mobile: '9876543210',
            fatherName: 'Robert Doe',
            fatherMobile: '9876543211',
            photoUrl: 'https://example.com/photos/john.jpg',
            gradeSection: `[Grade 1]-[A]`,
            academicYear: new Date().getFullYear()
        });

        // Add Instructions sheet
        const instructionsSheet = workbook.addWorksheet('Instructions');
        instructionsSheet.columns = [
            { header: 'Field', key: 'field', width: 20 },
            { header: 'Description', key: 'description', width: 60 },
            { header: 'Example', key: 'example', width: 30 }
        ];

        instructionsSheet.getRow(1).font = { bold: true };
        instructionsSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCCCCC' }
        };

        // Fetch grades and sections for reference
        const [grades] = await db.promise().query('SELECT id, grade_name FROM grades ORDER BY id');
        // Also include the grade_id on sections so lookups can map back to numeric ids
        const [sections] = await db.promise().query(
            'SELECT s.id, s.section_name, g.grade_name, s.grade_id FROM sections s JOIN grades g ON s.grade_id = g.id ORDER BY g.id, s.section_name'
        );

        const gradesList = grades.map(g => `${g.id} - ${g.grade_name}`).join(', ');
        const sectionsList = sections.map(s => `${s.id} - ${s.section_name} (${s.grade_name})`).join(', ');

        instructionsSheet.addRows([
            { field: 'Name', description: 'Full name of the student (Required)', example: 'John Doe' },
            { field: 'Roll', description: 'Unique roll number (Required)', example: 'STU001' },
            { field: 'Email', description: 'Valid email address (Required)', example: 'john@example.com' },
            { field: 'DOB', description: 'Date of birth in YYYY-MM-DD format (Required)', example: '2010-05-15' },
            { field: 'Gender', description: 'Male, Female, or Other (Required)', example: 'Male' },
            { field: 'Mobile', description: '10-digit mobile number (Required)', example: '9876543210' },
            { field: 'FatherName', description: 'Father\'s full name (Required)', example: 'Robert Doe' },
            { field: 'FatherMobile', description: '10-digit father\'s mobile (Required)', example: '9876543211' },
            { field: 'PhotoURL', description: 'URL to student photo (Required)', example: 'https://example.com/photo.jpg' },
            { field: 'Grade-Section', description: 'Select Grade+Section from dropdown (Required). Server will resolve numeric IDs from this value during upload.', example: '[Grade 1]-[A]' },
            { field: 'AcademicYear', description: `Academic year (Required). Current: ${new Date().getFullYear()}`, example: new Date().getFullYear().toString() }
        ]);

        // Extra instruction: Grade-Section dropdown helper
        instructionsSheet.addRow({ field: 'Grade-Section', description: 'Optional dropdown to help pick grade+section. After selecting, set GradeID and SectionID accordingly for bulk upload.', example: '[Grade 1]-[Section A]' });

        // Create Lookups sheet (hidden) with combined grade-section values used for dropdown
        const lookup = workbook.addWorksheet('Lookups');
        // Header
        lookup.getCell('A1').value = 'Grade-Section';
        lookup.getCell('B1').value = 'GradeID';
        lookup.getCell('C1').value = 'SectionID';

        // Populate lookup rows starting at row 2
        let lookupRow = 2;
        sections.forEach(s => {
            const combined = `[${s.grade_name}]-[${s.section_name}]`;
            lookup.getCell(`A${lookupRow}`).value = combined;
            lookup.getCell(`B${lookupRow}`).value = s.grade_id || null;
            lookup.getCell(`C${lookupRow}`).value = s.id || null;
            lookupRow++;
        });

        // Hide the lookups sheet so users don't edit it accidentally
        lookup.state = 'hidden';

        // Apply data validation (dropdown) on Grade-Section column for a reasonable number of rows
        const lookupCount = lookupRow - 2; // number of lookup entries
        if (lookupCount > 0) {
            const firstLookupCell = 2; // row index where lookup data starts
            const lastLookupRow = lookupRow - 1;
            const formulaRange = `=Lookups!$A$${firstLookupCell}:$A$${lastLookupRow}`;

            // Apply to rows 2..500
            const maxRows = 500;
            const gradeSectionCol = worksheet.columns.findIndex(c => c.key === 'gradeSection') + 1; // 1-based
            for (let r = 2; r <= maxRows; r++) {
                const cell = worksheet.getRow(r).getCell(gradeSectionCol);
                cell.dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    showErrorMessage: true,
                    formulae: [formulaRange]
                };
            }
        }

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=student_enrollment_template.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error("Error generating template:", error);
        res.status(500).json({ success: false, message: "Failed to generate template" });
    }
};

// Bulk upload students
exports.bulkUploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet('Students');

        if (!worksheet) {
            return res.status(400).json({ success: false, message: "Invalid file format. 'Students' sheet not found." });
        }

        let processed = 0;
        let succeeded = 0;
        const failed = [];

        const conn = await db.promise().getConnection();

        // We will resolve Grade & Section from the Grade-Section dropdown string (col 10).
        // Preload grade/section lookup map: key -> '[GradeName]-[SectionName]' -> { grade_id, section_id }
        const [lookupRows] = await conn.query(
            `SELECT s.id as section_id, s.section_name, s.grade_id, g.grade_name
             FROM sections s JOIN grades g ON s.grade_id = g.id`
        );
        const lookupMap = new Map();
        lookupRows.forEach(r => {
            const key = `[${r.grade_name}]-[${r.section_name}]`;
            lookupMap.set(key.toLowerCase(), { grade_id: r.grade_id, section_id: r.section_id });
        });

        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);

            // Skip empty rows
            if (!row.getCell(1).value) continue;

            processed++;

            try {
                // Read raw DOB cell and normalize to YYYY-MM-DD to avoid SQL datetime errors
                const dobCellRaw = row.getCell(4).value;
                let dobFormatted = '';
                if (dobCellRaw instanceof Date) {
                    const yyyy = dobCellRaw.getFullYear();
                    const mm = String(dobCellRaw.getMonth() + 1).padStart(2, '0');
                    const dd = String(dobCellRaw.getDate()).padStart(2, '0');
                    dobFormatted = `${yyyy}-${mm}-${dd}`;
                } else {
                    const txt = (dobCellRaw || '').toString().trim();
                    if (/^\d{4}-\d{2}-\d{2}$/.test(txt)) {
                        dobFormatted = txt;
                    } else {
                        // Try to parse various date string formats
                        const parsed = new Date(txt);
                        if (!isNaN(parsed)) {
                            const yyyy = parsed.getFullYear();
                            const mm = String(parsed.getMonth() + 1).padStart(2, '0');
                            const dd = String(parsed.getDate()).padStart(2, '0');
                            dobFormatted = `${yyyy}-${mm}-${dd}`;
                        } else {
                            dobFormatted = txt; // leave as-is so later validation can catch it
                        }
                    }
                }

                const studentData = {
                    name: row.getCell(1).value?.toString().trim() || '',
                    roll: row.getCell(2).value?.toString().trim() || '',
                    email: row.getCell(3).value?.toString().trim() || '',
                    dob: dobFormatted || '',
                    gender: row.getCell(5).value?.toString().trim() || '',
                    mobileNumber: row.getCell(6).value?.toString().trim() || '',
                    fatherName: row.getCell(7).value?.toString().trim() || '',
                    fatherMobile: row.getCell(8).value?.toString().trim() || '',
                    photoUrl: row.getCell(9).value?.toString().trim() || '',
                    gradeSectionStr: row.getCell(10).value?.toString().trim() || '',
                    academicYear: parseInt(row.getCell(11).value) || new Date().getFullYear()
                };

                // Validate required fields
                if (!studentData.name || !studentData.roll || !studentData.email || !studentData.dob ||
                    !studentData.gender || !studentData.mobileNumber || !studentData.fatherName ||
                    !studentData.fatherMobile || !studentData.photoUrl || !studentData.gradeSectionStr) {
                    failed.push({ row: rowNumber, reason: 'Missing required fields', data: studentData });
                    continue;
                }

                // Resolve grade & section from the dropdown string
                const lookupKey = studentData.gradeSectionStr.toLowerCase();
                const mapping = lookupMap.get(lookupKey);
                if (!mapping) {
                    failed.push({ row: rowNumber, reason: `Invalid Grade-Section value: ${studentData.gradeSectionStr}`, data: studentData });
                    continue;
                }

                studentData.gradeId = mapping.grade_id;
                studentData.sectionId = mapping.section_id;

                await conn.beginTransaction();

                try {
                    // Check if user exists
                    const [existingUsers] = await conn.query('SELECT id FROM users WHERE phone = ?', [studentData.mobileNumber]);
                    let userId;

                    if (existingUsers.length > 0) {
                        userId = existingUsers[0].id;
                    } else {
                        const hashedPassword = await bcrypt.hash(studentData.dob, 12);
                        const [userResult] = await conn.query(
                            'INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)',
                            [studentData.email, studentData.mobileNumber, hashedPassword]
                        );
                        userId = userResult.insertId;

                        // Assign Parent role
                        const [roleData] = await conn.query('SELECT id FROM roles WHERE role = ?', ['Parent']);
                        if (roleData.length > 0) {
                            await conn.query(
                                'INSERT INTO user_roles (user_id, role_id, is_active) VALUES (?, ?, 1)',
                                [userId, roleData[0].id]
                            );
                        }
                    }

                    // Check if student exists
                    const [existingStudent] = await conn.query(
                        'SELECT id FROM students WHERE roll = ?',
                        [studentData.roll]
                    );
                    let studentId;

                    if (existingStudent.length > 0) {
                        studentId = existingStudent[0].id;
                        await conn.query(
                            `UPDATE students SET 
                                user_id = ?, name = ?, dob = ?, email = ?, mobile = ?, 
                                father_name = ?, father_phone = ?, photo_url = ?, updated_at = NOW() 
                            WHERE id = ?`,
                            [userId, studentData.name, studentData.dob, studentData.email, studentData.mobileNumber,
                             studentData.fatherName, studentData.fatherMobile, studentData.photoUrl, studentId]
                        );
                    } else {
                        const [studentResult] = await conn.query(
                            `INSERT INTO students (
                                user_id, roll, name, dob, email, mobile, father_name, father_phone, photo_url, created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                            [userId, studentData.roll, studentData.name, studentData.dob, studentData.email,
                             studentData.mobileNumber, studentData.fatherName, studentData.fatherMobile, studentData.photoUrl]
                        );
                        studentId = studentResult.insertId;

                        // Initialize attendance
                        await conn.query(
                            `INSERT INTO student_attendence (
                                student_id, total_days, present_days, leave_days, on_duty, academic_year, created_at
                            ) VALUES (?, 0, 0, 0, 0, ?, NOW())`,
                            [studentId, studentData.academicYear]
                        );
                    }

                    // Get mentor for section
                    const [mentorAssignment] = await conn.query(
                        'SELECT mentor_id FROM mentor_section_assignments WHERE section_id = ? AND is_active = 1 LIMIT 1',
                        [studentData.sectionId]
                    );
                    const mentorId = mentorAssignment.length > 0 ? mentorAssignment[0].mentor_id : null;

                    // Student mapping
                    const [existingMapping] = await conn.query(
                        'SELECT id FROM student_mappings WHERE student_id = ? AND academic_year = ?',
                        [studentId, studentData.academicYear]
                    );

                    if (existingMapping.length > 0) {
                        await conn.query(
                            'UPDATE student_mappings SET section_id = ?, mentor_id = ?, updated_at = NOW() WHERE student_id = ? AND academic_year = ?',
                            [studentData.sectionId, mentorId, studentId, studentData.academicYear]
                        );
                    } else {
                        await conn.query(
                            `INSERT INTO student_mappings (
                                student_id, section_id, mentor_id, academic_year, created_by, created_at, updated_at
                            ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                            [studentId, studentData.sectionId, mentorId, studentData.academicYear, userId]
                        );
                    }

                    await conn.commit();
                    succeeded++;

                } catch (error) {
                    await conn.rollback();
                    throw error;
                }

            } catch (error) {
                console.error(`Error processing row ${rowNumber}:`, error);
                failed.push({ row: rowNumber, reason: error.message, data: row.values });
            }
        }

        conn.release();

        res.json({
            success: true,
            message: "Bulk upload completed",
            data: { processed, succeeded, failed }
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        res.status(500).json({ success: false, message: "Bulk upload failed", error: error.message });
    }
};

