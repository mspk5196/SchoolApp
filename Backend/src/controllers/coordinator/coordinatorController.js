const db = require('../../config/db');

exports.getCoordinatorData = (req, res) => {
  const { phoneNumber } = req.body;
  const sql = `
    SELECT c.id AS id, c.roll, c.phone, c.section_id, c.grade_id, u.name,
           sec.section_name, g.grade_name, sub.subject_name
    FROM Coordinators c
    LEFT JOIN Sections sec ON c.section_id = sec.id
    JOIN Users u ON c.phone = u.phone
    JOIN Grades g ON c.grade_id = g.id
    LEFT JOIN Subjects sub ON c.subject_id = sub.id
    WHERE c.phone = ?;
  `;
  db.query(sql, [phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, coordinatorData: results[0] });
  });
};

exports.coordinatorMentors = (req, res) => {
  const { gradeId } = req.body;
  const sql = `
    SELECT m.id AS mentor_id, u.name AS mentor_name, m.roll AS mentor_roll, g.grade_name AS grade_name,
           sec.id AS section_id, sec.section_name, sub.subject_name
    FROM Mentors m
    JOIN Users u ON m.phone = u.phone
    JOIN Sections sec ON m.section_id = sec.id
    JOIN Subjects sub ON m.subject_id = sub.id
    JOIN Grades g ON sec.grade_id = g.id
    WHERE sec.grade_id = ?;
  `;
  db.query(sql, [gradeId], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, mentors: results });
  });
};

exports.coordinatorStudents = (req, res) => {
  const { gradeId } = req.body;
  const sql = `
    SELECT g.grade_name, s.section_name, st.roll, st.name AS student_name, u.name AS mentor_name
    FROM Students st
    JOIN Sections s ON st.section_id = s.id
    JOIN Grades g ON s.grade_id = g.id
    LEFT JOIN Mentors m ON st.section_id = m.section_id
    LEFT JOIN Users u ON m.phone = u.phone
    LEFT JOIN Subjects subj ON m.subject_id = subj.id
    WHERE g.id = ?
    ORDER BY s.section_name, st.name;
  `;
  db.query(sql, [gradeId], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, coordinatorStudents: results });
  });
};

exports.fetchDocumentTypes = (req, res) => {

  const sql = `
      SELECT * FROM Document_Types ORDER BY id ASC;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching document types:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    console.log("Fetched doc types:", data);
    res.json({ success: true, message: "Document Types fetched successfully", docTypes: result });
  });
};
exports.fetchDocumentPurpose = (req, res) => {

  const sql = `
      SELECT * FROM Request_Purposes ORDER BY ID;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching document types:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Document Types fetched successfully", docPurpose: result });
  });
};

exports.insertDocType = (req, res) => {
  const { names } = req.body;

  if (!names) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const values = names.map(name => [name]);

  const sql = `
      INSERT INTO Document_Types (name)
      VALUES ?`;

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error adding new request type:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "New Request added successfully" });
  });
};
exports.insertDocPurpose = (req, res) => {
  const { names } = req.body;

  if (!names) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const sql = `
      INSERT INTO Request_Purposes (name)
      VALUES ?`;

  const values = names.map(name => [name]);

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("Error adding new document purpose:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "New Document purpoose added successfully" });
  });
};

exports.getStudentCoordinatorRequests = (req, res) => {
  const { gradeID } = req.body;
  console.log("Received gradeID:", req.body.gradeID);
  const sql = `
    SELECT * FROM Document_Requests
    WHERE grade_id = ?
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching student request:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Student Request fetched successfully", coordinatorStuRequest: results });
  });
};

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

exports.uploadRequestDocuments = async (req, res) => {
  const { request_id } = req.body;
  let document_titles = req.body.document_titles;
  let connection;

  try {
    document_titles = typeof document_titles === 'string'
      ? JSON.parse(document_titles)
      : document_titles;

    if (!req.files?.length || req.files.length !== document_titles.length) {
      return res.status(400).json({
        success: false,
        message: 'File/document title mismatch'
      });
    }

    connection = await db.promise().getConnection();
    await connection.query('START TRANSACTION');

    // Process each file
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Get the file extension from originalname
      const fileExt = path.extname(file.originalname).toLowerCase();

      // Generate new file path with .pdf extension
      const fileId = uuidv4(); // or any unique ID generation method
      const newFilePath = path.join('uploads/documents', `${fileId}.pdf`);

      // Rename/move the file to ensure .pdf extension
      fs.renameSync(file.path, path.join(__dirname, '../..', newFilePath));

      await connection.query(
        `INSERT INTO Student_Document 
        (request_id, document_type, file_name, file_path)  
        VALUES (?, ?, ?, ?)`,
        [request_id, document_titles[i], file.originalname, newFilePath]
      );
    }

    await connection.query(
      `UPDATE Document_Requests SET status = 'Received' 
      WHERE requestID = ?`,
      [request_id]
    );

    await connection.query('COMMIT');
    res.json({ success: true, count: req.files.length });

  } catch (err) {
    if (connection) {
      await connection.query('ROLLBACK').catch(console.error);
      connection.release();
    }
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Document upload failed'
    });
  } finally {
    if (connection) connection.release();
  }
};

exports.getGradeSubject = (req, res) => {
  const { gradeID } = req.body;
  console.log("Received gradeID:", (req.body.sectionID || gradeID));
  const sql = `
    SELECT DISTINCT sub.id AS subject_id, sub.subject_name
    FROM section_subject_activities ss
    JOIN sections sec ON ss.section_id = sec.id
    JOIN subjects sub ON ss.subject_id = sub.id
    WHERE sec.grade_id = ?;
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching grade subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject data fetched successfully", gradeSubjects: results });
  });
};

exports.uploadStudyMaterial = async (req, res) => {
  const { grade_id, subject_id, level, expected_date } = req.body;
  let connection;

  try {
    const uploadDir = path.join(__dirname, '../..', 'uploads', 'materials');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    connection = await db.promise().getConnection();
    await connection.query('START TRANSACTION');

    for (let file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const fileId = uuidv4();
      const newFileName = `${fileId}${ext}`;
      const relativePath = path.join('uploads', 'materials', newFileName);
      const absolutePath = path.join(__dirname, '../..', relativePath);

      // Move file to /uploads/materials
      fs.renameSync(file.path, absolutePath);

      const materialType = file.mimetype.includes('video') ? 'Video' : 'PDF';

      await connection.query(
        `INSERT INTO Materials 
         (grade_id, subject_id, level, material_type, file_name, file_url, expected_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          grade_id,
          subject_id,
          level,
          materialType,
          file.originalname,
          relativePath.replace(/\\/g, '/'), // Ensures URL is safe on all OS
          expected_date || null
        ]
      );
    }

    await connection.query('COMMIT');
    res.json({ success: true, message: 'Study materials uploaded successfully' });
  } catch (err) {
    if (connection) {
      await connection.query('ROLLBACK').catch(console.error);
      connection.release();
    }
    console.error('Upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to upload study materials',
    });
  } finally {
    if (connection) connection.release();
  }
};

exports.getMaterials = async (req, res) => {
  const { gradeID, subjectID } = req.query;
  console.log(`[GET] /api/coordinator/getMaterials?gradeID=${gradeID}&subjectID=${subjectID}`);

  if (!gradeID || !subjectID) {
    return res.status(400).json({ error: 'Missing gradeID or subjectID' });
  }

  const sql = `
    SELECT * FROM materials 
      WHERE grade_id = ? AND subject_id = ?
      ORDER BY level
  `;
  db.query(sql, [gradeID, subjectID], (err, results) => {
    if (err) {
      console.error("Error fetching subjects materials data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject materials data fetched successfully", materials: results });
    console.log(results);

  });
};

exports.deleteMaterial = (req, res) => {
  const { fileId } = req.body;

  // First get the file path
  const getFileQuery = 'SELECT file_url FROM Materials WHERE id = ?';
  db.query(getFileQuery, [fileId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const filePath = results[0].file_url;
    const absolutePath = path.join(__dirname, '../..', filePath);

    const sql = 'DELETE FROM materials WHERE id = ?';
    db.query(sql, [fileId], (err, result) => {
      if (err) {
        console.error('Failed to delete from DB:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
      // Delete the file from filesystem
      fs.unlink(absolutePath, (fsErr) => {
        if (fsErr) {
          console.error('File deletion error:', fsErr);
          return res.status(200).json({ success: true, message: 'DB record deleted, but file not found' });
        }

        return res.json({ success: true, message: 'File and DB record deleted successfully' });
      });
    });
  })


};

// Delete all materials of a level
exports.deleteLevel = (req, res) => {
  const { level, gradeID, subjectID } = req.body;

  const getFileQuery = 'SELECT file_url FROM Materials WHERE level = ? AND grade_id = ? AND subject_id = ?';
  db.query(getFileQuery, [level, gradeID, subjectID], (err, results) => {
    if (err) {
      console.error('Fetch files error:', err);
      return res.status(500).json({ success: false, message: 'Server error while fetching materials' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No materials found for the given level' });
    }

    // Delete all matching files from the file system
    results.forEach((row) => {
      const filePath = path.join(__dirname, '../..', row.file_url);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.error(`ÔØî Error deleting file ${filePath}:`, fsErr.message);
        } else {
          console.log(`Ô£à Deleted file: ${filePath}`);
        }
      });
    });

    // Delete all matching records from the DB
    const deleteQuery = 'DELETE FROM Materials WHERE level = ? AND grade_id = ? AND subject_id = ?';
    db.query(deleteQuery, [level, gradeID, subjectID], (err, result) => {
      if (err) {
        console.error('Delete level error:', err);
        return res.status(500).json({ success: false, message: 'Server error while deleting materials' });
      }

      return res.json({ success: true, message: 'All files and DB records for this level deleted successfully' });
    });
  });
};

exports.updateExpectedDate = (req, res) => {
  const { level, grade_id, subject_id, expected_date } = req.body;

  const sql = `
    UPDATE Materials
    SET expected_date = ?
    WHERE level = ? AND grade_id = ? AND subject_id = ?
  `;

  db.query(sql, [expected_date, level, grade_id, subject_id], (err, result) => {
    if (err) {
      console.error("Update error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    res.json({ success: true, message: "Expected date updated successfully" });
  });
};

//LevelPromotion

exports.getLevelPassPercentages = (req, res) => {
  const { gradeId } = req.query;

  const sql = `
    SELECT lpp.id, lpp.grade_id, lpp.subject_id, lpp.percent, 
           s.subject_name, g.grade_name
    FROM level_pass_percent lpp
    JOIN subjects s ON lpp.subject_id = s.id
    JOIN grades g ON lpp.grade_id = g.id
    WHERE lpp.grade_id = ?
  `;

  db.query(sql, [gradeId], (err, results) => {
    if (err) {
      console.error("Error fetching level pass percentages:", err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    // Transform the array into an object with subject_id as keys
    const percentages = {};
    results.forEach(item => {
      percentages[item.subject_id] = item.percent;
    });

    res.json({
      success: true,
      data: {
        percentages,
        details: results // Optional: send full details if needed
      }
    });
  });
};

// Update level pass percentage
exports.updateLevelPassPercentages = (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid updates format'
    });
  }

  let completed = 0;
  let hasError = false;

  const checkDone = () => {
    completed++;
    if (completed === updates.length && !hasError) {
      res.json({
        success: true,
        message: 'All percentages updated successfully'
      });
    }
  };

  const handleError = (err) => {
    if (!hasError) {
      hasError = true;
      console.error("Update error:", err);
      res.status(500).json({
        success: false,
        message: 'Database error during batch update'
      });
    }
  };

  updates.forEach((update) => {
    const { grade_id, subject_id, percent } = update;

    // Convert subject_id to number in case it's a string
    const subjectIdNum = parseInt(subject_id);

    db.query(
      `SELECT id FROM level_pass_percent WHERE grade_id = ? AND subject_id = ?`,
      [grade_id, subjectIdNum],
      (selectErr, result) => {
        if (selectErr) return handleError(selectErr);

        if (result.length > 0) {
          // UPDATE
          db.query(
            `UPDATE level_pass_percent SET percent = ? WHERE grade_id = ? AND subject_id = ?`,
            [percent, grade_id, subjectIdNum],
            (updateErr) => {
              if (updateErr) return handleError(updateErr);
              checkDone();
            }
          );
        } else {
          // INSERT
          db.query(
            `INSERT INTO level_pass_percent (grade_id, subject_id, percent) VALUES (?, ?, ?)`,
            [grade_id, subjectIdNum, percent],
            (insertErr) => {
              if (insertErr) return handleError(insertErr);
              checkDone();
            }
          );
        }
      }
    );
  });
};


//General
exports.getSubjects = (req, res) => {

  const sql = `
    SELECT * FROM Subjects
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching subjects:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subjects fetched successfully", subjects: results });
  });
};

exports.getGradeSections = (req, res) => {
  const { gradeID } = req.body;
  console.log("Received gradeID:", req.body.gradeID);
  const sql = `
    SELECT sec.id, sec.section_name, sec.grade_id
    FROM Sections sec
    WHERE grade_id = ?
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching sections data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Sections data fetched successfully", gradeSections: results });
  });
};

exports.getGrades = (req, res) => {

  const sql = `SELECT * FROM Grades`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching grades data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Grades data fetched successfully", grades: results });
  });
};

exports.getActivities = (req, res) => {

  const sql = `
    SELECT * FROM activity_types
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching activity types:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Activity types fetched successfully", activity_types: results });
  });
};

const bcrypt = require('bcrypt');

// Student Enrollment

exports.enrollStudent = async (req, res) => {
  try {
    const { name, dob, gender, grade, section, mobileNumber } = req.body;
    const profilePhoto = req.file;

    if (!name || !dob || !gender || !grade || !section || !mobileNumber || !profilePhoto) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const profilePhotoPath = path.join('uploads/profileImages/students', profilePhoto.filename);

    const con = db.promise(); // <<== IMPORTANT!!

    const [studentCountResult] = await con.query(`
      SELECT COUNT(*) AS student_count 
      FROM Students
      JOIN Sections sec ON Students.section_id = sec.id
      WHERE sec.grade_id = ?
    `, [grade]);

    let studentCount = studentCountResult.student_count || 0;
    studentCount++; // new student

    const rollNumber = `S${grade}${(1000 + studentCount).toString().substring(1)}`;

    const trx = await con.beginTransaction();

    try {
      await trx.query(
        `INSERT INTO Students (name, dob, gender, section_id, father_mob, profile_photo, roll)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, dob, gender, section, mobileNumber, profilePhotoPath, rollNumber]
      );

      await trx.commit();
      res.json({ success: true, message: "Student enrolled successfully", rollNumber });
    } catch (err) {
      console.error("Enrollment error (rollback):", err);
      await trx.rollback();
      res.status(500).json({ success: false, message: "Failed to enroll student" });
    }
  } catch (err) {
    console.error("Enrollment error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Mentor Enrollment
exports.enrollMentor = async (req, res) => {
  try {
    const { name, dob, section, subject, mobileNumber, specification, email, grade } = req.body;
    const profilePhoto = req.file;
    const con = db.promise();
    if (!profilePhoto) {
      return res.status(400).json({ success: false, message: "Profile photo is required" });
    }

    const gradeNumber = typeof grade === 'string' ? grade.match(/\d+/)?.[0] : grade;

    // Get current student count for this grade
    const countResult = await con.query(
      `SELECT COUNT(*) as mentor_count 
       FROM Mentors m`,
    );

    const mentorCount = countResult.length > 0 ? countResult[0].mentor_count + 1 : 1;
    console.log(countResult);
    // Generate roll number in S1001 format
    const newRoll = `M${String(mentorCount).padStart(3, '0')}`;
    const photoPath = profilePhoto.path;

    // Start transaction
    const connection = await con.beginTransaction();
    // const connection = await db.promise().getConnection();
    // await connection.beginTransaction();

    try {
      // Check if user already exists
      const existingUser = await connection.query(
        `SELECT * FROM Users WHERE phone = ?`,
        [mobileNumber]
      );

      if (existingUser.length > 0) {
        // User exists - update roles if needed
        let roles = existingUser[0].roles;
        if (!roles.includes('Mentor')) {
          roles = roles + ',Mentor';
        }

        await connection.query(
          `UPDATE Users SET roles = ? WHERE phone = ?`,
          [roles, mobileNumber]
        );
      } else {
        // New user - hash DOB for password
        const hashedPassword = await bcrypt.hash(dob, 12);

        await connection.query(
          `INSERT INTO Users (name, email, phone, password_hash, roles)
           VALUES (?, ?, ?, ?, ?)`,
          [name, email, mobileNumber, hashedPassword, 'Mentor']
        );
        // `${newRoll}@school.com`
      }

      // Insert into Mentors table
      await connection.query(
        `INSERT INTO Mentors (roll, phone, user_type, specification, dob, grade_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [newRoll, mobileNumber, 'Mentor', specification, dob, gradeNumber]
      );

      // Insert profile photo into user_photos table
      await connection.query(
        `INSERT INTO user_photos (phone, roll, file_path, is_profile_photo)
         VALUES (?, ?, ?, ?)`,
        [mobileNumber, newRoll, photoPath, 1]
      );

      await connection.commit();
      res.json({ success: true, message: "Mentor enrolled successfully" });
    } catch (err) {
      await connection.rollback();
      console.error("DB Insert Error:", err);
      res.status(500).json({ success: false, message: "Database error" });
    } finally {
      if (connection && typeof connection.release === 'function') {
        connection.release();
      }
    }

  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//SubjectAllotment
exports.getSubjectActivities = (req, res) => {
  const { sectionID } = req.body;

  const sql = `
    SELECT ssa.id, ssa.subject_id, ssa.section_id, at.activity_type, s.subject_name, at.id AS activity_type_id
    FROM section_subject_activities ssa
    JOIN subjects s ON ssa.subject_id = s.id
    LEFT JOIN activity_types at ON ssa.activity_type = at.id
    WHERE section_id = ?
  `;
  db.query(sql, [sectionID], (err, results) => {
    if (err) {
      console.error("Error fetching subject section activities data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Sections subject data fetched successfully", subjectActivities: results });
  });
};

exports.addSubjectActivity = (req, res) => {
  const { section_id, subject_id, activity_type } = req.body;

  const sql = `
    INSERT INTO section_subject_activities (section_id, subject_id, activity_type)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [section_id, subject_id, activity_type], (err, results) => {
    if (err) {
      console.error("Error adding subject section activities data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Sections subject data added successfully" });
  });
};

exports.removeSubjectActivity = (req, res) => {
  const { id } = req.body;

  const sql = `
    DELETE FROM section_subject_activities WHERE id=?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error deleting subject section activities data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Sections subject data deleting successfully" });
  });
};

exports.removeSubject = (req, res) => {
  const { section_id, subject_id } = req.body;

  const sql = `
    DELETE FROM section_subject_activities WHERE section_id=? AND subject_id=?
  `;
  db.query(sql, [section_id, subject_id], (err, results) => {
    if (err) {
      console.error("Error deleting subject section activities data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Sections subject data deleting successfully" });
  });
};

exports.addSubjectToSection = (req, res) => {
  const { section_id, subject_id } = req.body;

  const sql = `
    INSERT INTO section_subject_activities (section_id, subject_id)
    VALUES (?, ?)
  `;
  db.query(sql, [section_id, subject_id], (err, results) => {
    if (err) {
      console.error("Error adding subject to section:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject added to section successfully" });
  });
};

exports.addSubjects = (req, res) => {
  const { subjects } = req.body;

  // Validate input
  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of subjects'
    });
  }

  // Create an array of arrays for parameter binding
  const values = subjects.map(subject => [subject.name]);

  const sql = `
    INSERT INTO subjects (subject_name)
    VALUES ?
  `;

  db.query(sql, [values], (err, results) => {
    if (err) {
      console.error("Error adding subjects:", err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    // Return the inserted count and IDs
    res.json({
      success: true,
      message: `${results.affectedRows} subjects added successfully`,
      insertedIds: results.insertId // First inserted ID
    });
  });
};

exports.addSubjectToSection = (req, res) => {
  const { section_id, subject_id } = req.body;

  const sql = `
    INSERT INTO section_subject_activities (section_id, subject_id)
    VALUES (?, ?)
  `;
  db.query(sql, [section_id, subject_id], (err, results) => {
    if (err) {
      console.error("Error adding subject to section:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject added to section successfully" });
  });
};

exports.addActivities = (req, res) => {
  const { activities } = req.body;

  // Validate input
  if (!activities || !Array.isArray(activities) || activities.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an array of subjects'
    });
  }

  // Create an array of arrays for parameter binding
  const values = activities.map(activity => [activity.name]);

  const sql = `
    INSERT INTO activity_types (activity_type)
    VALUES ?
  `;

  db.query(sql, [values], (err, results) => {
    if (err) {
      console.error("Error adding activities:", err);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: err.message
      });
    }

    // Return the inserted count and IDs
    res.json({
      success: true,
      message: `${results.affectedRows} activities added successfully`,
      insertedIds: results.insertId // First inserted ID
    });
  });
};

//AcadamicSchedule
// Create or update academic schedule
exports.createOrUpdateSchedule = async (req, res) => {
  const { section_id, day, sessions } = req.body;

  // Step 1: Delete previous sessions
  const deleteSql = `
    DELETE FROM academic_schedule WHERE section_id = ? AND day = ?
  `;
  db.query(deleteSql, [section_id, day], (err, results) => {
    if (err) {
      console.error("Error deleting previous sessions of section:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Step 2: Insert new sessions
    const insertSessions = async () => {
      for (const session of sessions) {
        const { session_number, start_time, end_time, subject_id } = session;

        const createSql = `
          INSERT INTO academic_schedule (section_id, day, session_number, start_time, end_time, subject_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        try {
          await new Promise((resolve, reject) => {
            db.query(createSql, [section_id, day, session_number, start_time, end_time, subject_id], (err, results) => {
              if (err) {
                console.error("Error adding sessions of section:", err);
                reject(err);
              }
              resolve(results);
            });
          });
        } catch (error) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }
      }

      // Once all sessions are inserted, send a single response
      res.status(200).json({ success: true, message: "Schedule added to section successfully" });
    };

    insertSessions();
  });
};

// Get academic schedule by section and day
exports.getSchedule = async (req, res) => {
  const { section_id, day } = req.params;

  const sql = `
    SELECT 
        a.id, 
        a.section_id, 
        a.day,  
        a.session_number, 
        TIME_FORMAT(a.start_time, '%h:%i %p') as start_time, 
        TIME_FORMAT(a.end_time, '%h:%i %p') as end_time, 
        a.subject_id,
        s.subject_name
      FROM academic_schedule a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.section_id = ? AND a.day = ?
      ORDER BY a.session_number
  `;
  db.query(sql, [section_id, day], (err, results) => {
    if (err) {
      console.error("Error fetching academic schedule:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Academic schedule fetched", sessions: results });
  });
};

// Get all sections for a grade
exports.getSectionsByGrade = async (req, res) => {
  const { activeGrade } = req.body;

  const sql = `
    SELECT sec.id, sec.section_name, sec.grade_id
    FROM Sections sec
    WHERE grade_id = ?
  `;
  db.query(sql, [activeGrade], (err, results) => {
    if (err) {
      console.error("Error fetching sections data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Sections data fetched successfully", gradeSections: results });
  });
};

// Get all subjects
exports.getAllSubjects = (req, res) => {
  const sql = `
    SELECT id, subject_name FROM subjects
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subjects data fetched successfully", subjects: results });
  });
};

//ExamShedule
exports.createExamSchedule = (req, res) => {
  const { grade_id, subject_id, exam_date, start_time, end_time, recurrence } = req.body;

  const sql = `
    INSERT INTO Exam_Schedule 
    (grade_id, subject_id, exam_date, start_time, end_time, recurrence) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [grade_id, subject_id, exam_date, start_time, end_time, recurrence], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.status(201).json({ success: true, id: result.insertId, message: 'Exam schedule added successfully' });
  });
};

exports.getExamSchedule = (req, res) => {
  const { grade_id } = req.query;
  const sql = `SELECT es.*, s.subject_name
        FROM Exam_Schedule es
        LEFT JOIN Subjects s ON es.subject_id = s.id
        WHERE es.grade_id = ?
        ORDER BY es.exam_date;`;

  db.query(sql, [grade_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.status(200).json({ success: true, schedules: results });
  });
};

exports.updateExamSchedule = (req, res) => {
  const { id, grade_id, subject_id, exam_date, start_time, end_time, recurrence } = req.body;

  const examDateOnly = new Date(exam_date).toISOString().split('T')[0];
  const sql = `
    UPDATE Exam_Schedule 
    SET grade_id = ?, subject_id = ?, exam_date = ?, start_time = ?, end_time = ?, recurrence = ?
    WHERE id = ?`;

  db.query(sql, [grade_id, subject_id, examDateOnly, start_time, end_time, recurrence, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Updated successfully' });
  });
};

exports.deleteExamSchedule = (req, res) => {
  const { id } = req.body;
  const sql = `DELETE FROM Exam_Schedule WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  });
};

//InvigilationDuties
// Get exam schedule with invigilators
exports.getExamScheduleWithInvigilators = (req, res) => {
  const { grade_id } = req.query;

  const sql = `
    SELECT 
      es.id, 
      es.grade_id, 
      es.subject_id, 
      es.exam_date AS date,
      TIME_FORMAT(es.start_time, '%h:%i %p') AS start_time,
      TIME_FORMAT(es.end_time, '%h:%i %p') AS end_time,
      s.subject_name AS subject,
      GROUP_CONCAT(i.mentor_id) AS invigilator_ids,
      GROUP_CONCAT(u.name) AS invigilator_names,
      g.grade_name
    FROM Exam_Schedule es
    LEFT JOIN Subjects s ON es.subject_id = s.id
    LEFT JOIN invigilators i ON es.id = i.exam_id
    LEFT JOIN mentors m ON i.mentor_id = m.id
    LEFT JOIN users u ON m.phone = u.phone
    JOIN Grades g ON es.grade_id = g.id
    WHERE es.grade_id = ?
    GROUP BY es.id
    ORDER BY es.exam_date, es.start_time;
  `;

  db.query(sql, [grade_id], (err, results) => {
    if (err) {
      console.error("Error fetching exam schedule:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Transform the results to match the frontend format
    const formattedResults = results.map(exam => ({
      id: exam.id,
      subject: exam.subject,
      date: exam.date,
      time: `${exam.start_time} - ${exam.end_time}`,
      grade: exam.grade_name,
      invigilators: exam.invigilator_ids ?
        exam.invigilator_ids.split(',').map(Number) : [],
      invigilatorNames: exam.invigilator_names ?
        exam.invigilator_names.split(',') : [],
      color: '#6A5ACD' // Default color for exams
    }));

    res.json({ success: true, exams: formattedResults });
  });
};

// Assign invigilators to exam
exports.assignInvigilators = (req, res) => {
  const { exam_id, mentor_ids } = req.body;

  // First, delete existing invigilators for this exam
  const deleteSql = 'DELETE FROM invigilators WHERE exam_id = ?';

  db.query(deleteSql, [exam_id], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error("Error deleting existing invigilators:", deleteErr);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // If no mentors to assign, return success
    if (!mentor_ids || mentor_ids.length === 0) {
      return res.json({ success: true, message: 'Invigilators updated successfully' });
    }

    // Prepare values for batch insert
    const values = mentor_ids.map(mentor_id => [exam_id, mentor_id]);

    // Insert new invigilators
    const insertSql = 'INSERT INTO invigilators (exam_id, mentor_id) VALUES ?';

    db.query(insertSql, [values], (insertErr, insertResult) => {
      if (insertErr) {
        console.error("Error assigning invigilators:", insertErr);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({ success: true, message: 'Invigilators assigned successfully' });
    });
  });
};

// Get available mentors for invigilation
exports.getAvailableMentorsForInvigilation = (req, res) => {
  const { grade_id } = req.query;

  const sql = `
    SELECT 
      m.id,
      u.name,
      m.roll,
      m.specification,
      s.subject_name AS subject
    FROM mentors m
    JOIN users u ON m.phone = u.phone
    LEFT JOIN subjects s ON m.subject_id = s.id
    WHERE m.user_type = 'Mentor' OR m.user_type = 'Coordinator-Mentor'
    ORDER BY u.name;
  `;

  db.query(sql, [grade_id], (err, results) => {
    if (err) {
      console.error("Error fetching available mentors:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, mentors: results });
  });
};

//WeeklySchedule
// Get weekly schedule for a section and day
exports.getWeeklySchedule = (req, res) => {
  const { sectionId, day } = req.query;
  // console.log(sectionId, day);


  const query = `
    SELECT ws.*, s.subject_name, u.name as mentor_name
    FROM weekly_schedule ws
    JOIN subjects s ON ws.subject_id = s.id
    LEFT JOIN mentors m ON ws.mentors_id = m.id
    LEFT JOIN users u ON m.phone = u.phone
    WHERE ws.section_id = ? AND ws.day = ?
    ORDER BY ws.start_time`;

  db.query(query, [sectionId, day], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, scheduleItems: results });
  });
};

// Add or update a schedule item
exports.addOrUpdateWeeklySchedule = (req, res) => {
  const { sectionId, day, startTime, endTime, subjectId, mentorsId, activity, venue } = req.body;

  // Validate required fields
  if (!sectionId || !day || !startTime || !endTime || !subjectId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const query = `
    INSERT INTO weekly_schedule 
    (section_id, day, start_time, end_time, subject_id, mentors_id, activity, venue)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    subject_id = VALUES(subject_id),
    mentors_id = VALUES(mentors_id),
    activity = VALUES(activity),
    venue = VALUES(venue)`;

  db.query(query,
    [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        message: 'Schedule item saved successfully',
        id: results.insertId || req.body.id
      });
    });
};

// Delete a schedule item
exports.deleteWeeklySchedule = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM weekly_schedule WHERE id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Schedule item not found' });
    }

    res.json({ success: true, message: 'Schedule item deleted successfully' });
  });
};

// Get available mentors for a subject
exports.getAvailableMentors = (req, res) => {
  const { subjectId } = req.query;

  const query = `
    SELECT m.id, u.name, m.roll
    FROM mentors m
    JOIN users u ON m.phone = u.phone
    WHERE m.subject_id = ?`;

  db.query(query, [subjectId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, mentors: results });
  });
};

//Students Page
exports.getSectionStudents = (req, res) => {
  const { sectionID } = req.body;
  console.log("Received gradeID:", req.body.gradeID);
  const sql = `
    SELECT st.id, st.name, st.roll, st.profile_photo
    FROM Students st
    WHERE section_id = ?
  `;
  db.query(sql, [sectionID], (err, results) => {
    if (err) {
      console.error("Error fetching student data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Student data fetched successfully", sectionStudent: results });
  });
};

//Mentor Page

// API endpoint: /api/coordinator/mentor/getGradeMentors
exports.getGradeMentors = async (req, res) => {
  try {
    const { gradeID } = req.body;

    const query = `
    SELECT m.id AS mentor_id, u.name AS mentor_name, m.roll AS mentor_roll,m.phone, g.grade_name AS grade_name, up.file_path,
           sec.id AS section_id, sec.section_name, sub.subject_name, m.subject_id
      FROM Mentors m
      JOIN Users u ON m.phone = u.phone
      JOIN user_photos up ON m.phone = up.phone
      LEFT JOIN Sections sec ON m.section_id = sec.id
      LEFT JOIN Subjects sub ON m.subject_id = sub.id
      JOIN Grades g ON m.grade_id = g.id
      WHERE m.grade_id = ? ORDER BY sec.section_name, u.name;`;

    const mentors = await db.promise().query(query, [gradeID]);

    if (mentors.length > 0) {
      // Format the data as needed for the frontend
      const formattedMentors = mentors.map(mentor => ({
        id: mentor.mentor_id,
        name: mentor.mentor_name,
        roll: mentor.mentor_roll,
        photo_url: mentor.file_path || null,
        grade_name: mentor.grade_name,
        subject: mentor.subject_name,
        section_id: mentor.section_id,
        section_name: mentor.section_name,
        subject_id: mentor.subject_id,
        phone: mentor.phone
      }));

      res.json({ success: true, gradeMentors: formattedMentors });
    } else {
      res.json({ success: false, message: 'No mentors found for this grade' });
    }
  } catch (error) {
    console.error('Error fetching grade mentors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSectionMentor = (req, res) => {
  const { activeGrade } = req.body;

  const sql = `
    SELECT 
  m.id, 
  u.name AS mentor_name, 
  m.roll AS mentor_roll,
  m.specification,
  m.phone,
  m.subject_id,  
  m.section_id,
  up.file_path,
  sec.section_name, 
  sub.subject_name,
  m.grade_id,
  COUNT(st.id) AS student_count
FROM Mentors m
JOIN Users u ON m.phone = u.phone
LEFT JOIN user_photos up ON m.phone = up.phone
LEFT JOIN Sections sec ON m.section_id = sec.id
LEFT JOIN Subjects sub ON m.subject_id = sub.id
LEFT JOIN Students st ON st.section_id = sec.id
WHERE m.grade_id = ? AND m.section_id IS NOT NULL
GROUP BY 
  m.id, u.name, m.roll, m.specification, m.phone, m.subject_id,
  up.file_path, sec.section_name, sub.subject_name;
  `;
  db.query(sql, [activeGrade], (err, results) => {
    if (err) {
      console.error("Error fetching mentor data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Mentor data fetched successfully", sectionMentor: results });
  });
};

exports.getGradeNonEnroledMentors = (req, res) => {
  const { gradeID } = req.body;

  const sql = `
    SELECT m.id, u.name AS mentor_name, m.roll AS mentor_roll,m.specification,m.phone
      FROM Mentors m
      JOIN Users u ON m.phone = u.phone
      WHERE m.grade_id = ? AND m.section_id IS NULL AND m.subject_id IS NULL  ORDER BY m.roll;
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching mentor data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Mentor data fetched successfully", gradeMentors: results });
  });
};
// Assign mentor to section
exports.assignMentorToSection = async (req, res) => {
  const { mentor_id, section_id, grade_id } = req.body;

  try {
    // First verify the section belongs to the grade
    const sectionCheck = await db.promise().query(
      'SELECT id FROM sections WHERE id = ? AND grade_id = ?',
      [section_id, grade_id]
    );

    if (sectionCheck[0].length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Section does not belong to this grade'
      });
    }

    // Update the mentor's section
    await db.promise().query(
      'UPDATE mentors SET section_id = ?, grade_id = ? WHERE id = ?',
      [section_id, grade_id, mentor_id]
    );

    res.json({
      success: true,
      message: 'Mentor assigned to section successfully'
    });
  } catch (error) {
    console.error('Error assigning mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

exports.getMentorSectionStudents = (req, res) => {
  const { sectionID } = req.body;

  const sql = `
    SELECT st.id, st.name, st.roll, st.profile_photo
    FROM Students st
    WHERE st.section_id = ?
  `;
  db.query(sql, [sectionID], (err, results) => {
    if (err) {
      console.error("Error fetching student data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Student data fetched successfully", sectionStudents: results });
  });
};

exports.getMentorGradeSubject = (req, res) => {
  const { gradeID } = req.body;

  const sql = `
    SELECT DISTINCT sub.id AS subject_id, sub.subject_name
    FROM section_subject_activities ss
    JOIN sections sec ON ss.section_id = sec.id
    JOIN subjects sub ON ss.subject_id = sub.id
    WHERE sec.grade_id = ?;
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching grade subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject data fetched successfully", mentorGradeSubjects: results });
  });
};

exports.getGradeSubjects = (req, res) => {
  const { sectionID } = req.body;

  const sql = `
    SELECT DISTINCT sub.id AS subject_id, sub.subject_name
    FROM section_subject_activities ss
    JOIN subjects sub ON ss.subject_id = sub.id
    WHERE ss.section_id = ?;
  `;
  db.query(sql, [sectionID], (err, results) => {
    if (err) {
      console.error("Error fetching grade subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject data fetched successfully", mentorSubjects: results });
  });
};

exports.getSubjectGradeMentor = (req, res) => {
  const { gradeID } = req.body;

  const sql = `
    SELECT m.id, u.name, m.specification, m.roll
      FROM Mentors m
      JOIN Users u ON m.phone = u.phone
      JOIN Grades g ON m.grade_id = g.id
      WHERE m.grade_id = ? ORDER BY m.roll;
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching grade mentor data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Mentor data fetched successfully", gradeMentor: results });
  });
};

exports.getEnroledSubjectMentors = (req, res) => {
  const { gradeID, subjectID } = req.body;

  const sql = `
    SELECT msa.id, u.name, m.specification, m.roll, up.file_path
      FROM mentor_section_assignments msa
      JOIN Mentors m ON msa.mentor_id = m.id
      LEFT JOIN user_photos up ON m.phone = up.phone
      JOIN Users u ON m.phone = u.phone
      JOIN Grades g ON m.grade_id = g.id
      WHERE msa.grade_id = ? AND msa.subject_id = ? ORDER BY m.roll;
  `;
  db.query(sql, [gradeID, subjectID], (err, results) => {
    if (err) {
      console.error("Error fetching grade mentor data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Mentor data fetched successfully", gradeEnroledMentor: results });
  });
};

exports.getEnroledGradeSubjectMentor = (req, res) => {
  const { gradeID, subjectID } = req.body;

  const sql = `
    SELECT msa.id, u.name, m.specification, m.roll, up.file_path, msa.mentor_id
      FROM mentor_section_assignments msa
      JOIN Mentors m ON msa.mentor_id = m.id
      LEFT JOIN user_photos up ON m.phone = up.phone
      JOIN Users u ON m.phone = u.phone
      JOIN Grades g ON m.grade_id = g.id
      WHERE msa.grade_id = ? AND msa.subject_id = ? ORDER BY m.roll;
  `;
  db.query(sql, [gradeID, subjectID], (err, results) => {
    if (err) {
      console.error("Error fetching grade mentor data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Mentor data fetched successfully", enroledGradeSubjectMentor: results });
  });
};

// Assign mentor to subject
exports.assignMentorToSubject = async (req, res) => {
  const { mentor_id, subject_id, grade_id } = req.body;

  try {
    // First verify the mentor exists and belongs to the grade
    const mentorCheck = await db.promise().query(
      'SELECT id FROM mentors WHERE id = ? AND grade_id = ?',
      [mentor_id, grade_id]
    );

    if (mentorCheck[0].length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mentor does not belong to this grade'
      });
    }

    // Update the mentor's subject (set section_id to null)
    await db.promise().query(
      'INSERT INTO mentor_section_assignments (subject_id,mentor_id,grade_id) VALUES (?,?,?)',
      [subject_id, mentor_id, grade_id]
    );

    res.json({
      success: true,
      message: 'Mentor assigned to subject successfully'
    });
  } catch (error) {
    console.error('Error assigning mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};
exports.assignSubjectToMentorSection = async (req, res) => {
  const { section_id, mentor_id, subject_id, grade_id } = req.body;

  try {
    await db.promise().query(
      'UPDATE mentor_section_assignments SET section_id = ? WHERE subject_id = ? AND mentor_id = ? AND grade_id = ?',
      [section_id, subject_id, mentor_id, grade_id]
    );

    res.json({
      success: true,
      message: 'Mentor assigned to section subject successfully'
    });
  } catch (error) {
    console.error('Error assigning mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};

//Events
// Create a new event
exports.createEvent = (req, res) => {
  const { phone, event_name, location, participants_limit, event_date, grade_id, event_type, about, guidelines } = req.body;
  const banner_url = req.file ? req.file.path : null;

  const sql = `
      INSERT INTO events 
      (phone, event_name, location, participants_limit, event_date, grade_id, event_type, about, guidelines, banner_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.promise().query(sql, [
    phone,
    event_name,
    location,
    participants_limit,
    event_date,
    grade_id,
    event_type,
    about,
    guidelines,
    banner_url
  ], (err, result) => {
    if (err) {
      console.error("Error creating event:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, eventId: result.insertId });
  });
  // });
};

// Get all events for a coordinator
exports.getEvents = (req, res) => {
  const { phone } = req.query;

  const sql = `
    SELECT 
      e.*,
      g.grade_name,
      COUNT(ep.id) AS participants_count
    FROM events e
    LEFT JOIN grades g ON e.grade_id = g.id
    LEFT JOIN event_participants ep ON e.id = ep.event_id
    WHERE e.phone = ?
    GROUP BY e.id
    ORDER BY e.event_date DESC
  `;

  db.query(sql, [phone], (err, results) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, events: results });
  });
};

// Delete an event
exports.deleteEvent = (req, res) => {
  const { event_id } = req.body;

  // First delete participants
  db.query('DELETE FROM event_participants WHERE event_id = ?', [event_id], (err, result) => {
    if (err) {
      console.error("Error deleting event participants:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Then delete the event
    db.query('DELETE FROM events WHERE id = ?', [event_id], (err, result) => {
      if (err) {
        console.error("Error deleting event:", err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      res.json({ success: true, message: 'Event deleted successfully' });
    });
  });
};
