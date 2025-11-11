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
                // Create coordinator record regardless of grades
                const [existingCoord] = await conn.query('SELECT id FROM coordinators WHERE faculty_id = ?', [facultyId]);
                let coordinatorId;

                if (existingCoord.length > 0) {
                    coordinatorId = existingCoord[0].id;
                } else {
                    const [coordResult] = await conn.query(
                        'INSERT INTO coordinators (faculty_id, is_active, assigned_by, created_at) VALUES (?, 1, ?, NOW())',
                        [facultyId, facultyId]
                    );
                    coordinatorId = coordResult.insertId;
                }

                // Assign grades if provided
                if (grades && Array.isArray(grades) && grades.length > 0) {
                    for (const gradeId of grades) {
                        await conn.query(
                            'INSERT IGNORE INTO coordinator_grade_assignments (coordinator_id, grade_id, is_active, assigned_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                            [coordinatorId, gradeId, facultyId]
                        );
                    }
                }
            } else if (role === 'Mentor') {
                // Create mentor record regardless of sections
                const [existingMentor] = await conn.query('SELECT id FROM mentors WHERE faculty_id = ?', [facultyId]);
                let mentorId;

                if (existingMentor.length > 0) {
                    mentorId = existingMentor[0].id;
                } else {
                    const [mentorResult] = await conn.query(
                        'INSERT INTO mentors (faculty_id, assigned_by, is_active, created_at) VALUES (?, ?, 1, NOW())',
                        [facultyId, facultyId]
                    );
                    mentorId = mentorResult.insertId;
                }

                // Assign sections if provided
                if (sections && Array.isArray(sections) && sections.length > 0) {
                    for (const sectionId of sections) {
                        await conn.query(
                            'INSERT IGNORE INTO mentor_section_assignments (mentor_id, section_id, is_active, assigned_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                            [mentorId, sectionId, facultyId]
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
                            // Don't continue here, just skip this invalid grade
                        }
                    }
                }

                const sectionIdsArray = [];
                if (sectionsStr && role === 'Mentor') {

                    const gradeTokens = gradesStr.split(',').map(s => s.trim()).filter(Boolean);
                    for (const token of gradeTokens) {
                        const id = gradeMap.get(token) || gradeMap.get(token.toLowerCase());
                        if (id) {
                            gradeIds.push(id);
                        } else {
                            results.failed.push({ row: i, message: `Unknown grade: ${token}` });
                            // Don't continue here, just skip this invalid grade
                        }
                    }

                    const sectionTokens = sectionsStr.split(',').map(s => s.trim()).filter(Boolean);
                    for (const token of sectionTokens) {
                        const sid = parseInt(token);
                        if (isNaN(sid) || !sectionIds.has(sid)) {
                            results.failed.push({ row: i, message: `Unknown section ID: ${token}` });
                            // Don't continue here, just skip this invalid section
                        } else {
                            sectionIdsArray.push(sid);
                        }
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
                            'INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)',
                            [email, mobileNumber, hashedPassword]
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
                        // Create coordinator record regardless of grades
                        const [existingCoord] = await conn.query('SELECT id FROM coordinators WHERE faculty_id = ?', [facultyId]);
                        let coordinatorId;

                        if (existingCoord.length > 0) {
                            coordinatorId = existingCoord[0].id;
                        } else {
                            const [coordResult] = await conn.query(
                                'INSERT INTO coordinators (faculty_id, is_active, assigned_by, created_at) VALUES (?, 1, ?, NOW())',
                                [facultyId, facultyId]
                            );
                            coordinatorId = coordResult.insertId;
                        }

                        // Assign grades if provided
                        if (gradeIds.length > 0) {
                            for (const gid of gradeIds) {
                                await conn.query(
                                    'INSERT IGNORE INTO coordinator_grade_assignments (coordinator_id, grade_id, is_active, assigned_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                                    [coordinatorId, gid, facultyId]
                                );
                            }
                        }
                    } else if (role === 'Mentor') {
                        // Create mentor record regardless of sections
                        const [existingMentor] = await conn.query('SELECT id FROM mentors WHERE faculty_id = ?', [facultyId]);
                        let mentorId;

                        if (existingMentor.length > 0) {
                            mentorId = existingMentor[0].id;
                        } else {
                            const [mentorResult] = await conn.query(
                                'INSERT INTO mentors (faculty_id, assigned_by, is_active, created_at) VALUES (?, ?, 1, NOW())',
                                [facultyId, facultyId]
                            );
                            mentorId = mentorResult.insertId;
                        }

                        // Assign grades if provided
                        if (gradeIds.length > 0) {
                            for (const gid of gradeIds) {
                                await conn.query(
                                    'INSERT IGNORE INTO mentor_grade_assignments (mentor_id, grade_id, assigned_at) VALUES (?, ?, NOW())',
                                    [mentorId, gid]
                                );
                            }
                        }

                        // Assign sections if provided
                        if (sectionIdsArray.length > 0) {
                            for (const sid of sectionIdsArray) {
                                await conn.query(
                                    'INSERT IGNORE INTO mentor_section_assignments (mentor_id, section_id, is_active, assigned_by, created_at) VALUES (?, ?, 1, ?, NOW())',
                                    [mentorId, sid, facultyId]
                                );
                            }
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
        try { fs.unlinkSync(filePath); } catch (_) { }
    }
};
