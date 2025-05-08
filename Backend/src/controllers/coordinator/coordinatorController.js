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

//Profile
// For getting coordinator attendance data
exports.getAttendance = async (req, res) => {
  const { phone } = req.body;

  const query = `
      SELECT total_days, present_days, leave_days, on_duty_days, attendance_percentage
      FROM facultyattendance
      WHERE phone = ?
    `;

  db.query(query, [phone], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Attendance data not found' });

    res.json({
      success: true,
      attendanceData: results[0]
    });
  });
};

// Get mentor's subject and grade assignments
// Get mentor's subject and grade assignments (updated)
exports.getMentorAssignments = (req, res) => {
  const { mentorId } = req.body;
  
  const query = `
    SELECT DISTINCT 
      sub.id AS subject_id, 
      sub.subject_name,
      msa.grade_id,
      g.grade_name
    FROM mentor_section_assignments msa
    JOIN subjects sub ON msa.subject_id = sub.id
    JOIN Grades g ON msa.grade_id = g.id
    WHERE msa.mentor_id = ?
  `;
  
  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Extract unique subjects and grades
    const subjects = [];
    const grades = [];
    const seenSubjects = new Set();
    const seenGrades = new Set();
    
    results.forEach(row => {
      if (!seenSubjects.has(row.subject_id)) {
        subjects.push({
          subject_id: row.subject_id,
          subject_name: row.subject_name
        });
        seenSubjects.add(row.subject_id);
      }
      
      if (row.grade_id && !seenGrades.has(row.grade_id)) {
        grades.push({
          grade_id: row.grade_id
        });
        seenGrades.add(row.grade_id);
      }
    });
    
    res.json({ 
      success: true, 
      subjects,
      grades
    });
  });
};

// Get mentor's section information
exports.getMentorSection = (req, res) => {
  const { mentorId } = req.body;
  
  const query = `
    SELECT s.section_name
    FROM mentors m
    JOIN sections s ON m.section_id = s.id
    WHERE m.id = ?
  `;
  
  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.json({ 
      success: true, 
      section: results[0]?.section_name || 'Not assigned'
    });
  });
};

// Get mentor's issues count
exports.getMentorIssues = (req, res) => {
  const { mentorId } = req.body;
  
  const query = `
    SELECT COUNT(*) AS count
    FROM issue_log
    WHERE student_id IN (
      SELECT id FROM students WHERE section_id = (
        SELECT section_id FROM mentors WHERE id = ?
      )
    )
  `;
  
  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.json({ 
      success: true, 
      count: results[0]?.count || 0
    });
  });
};

// New endpoint to get mentor's schedule
exports.getMentorSchedule = (req, res) => {
  const { mentorId, date } = req.body;

  // Parse the date to get the day of week (e.g., "Monday")
  const dayOfWeek = getDayOfWeekFromDate(date);
  
  const query = `
    SELECT 
      asch.day,
      asch.start_time,
      asch.end_time,
      sub.subject_name,
      sec.section_name,
      g.grade_name,
      at.activity_type as activity_name
    FROM weekly_schedule asch
    JOIN subjects sub ON asch.subject_id = sub.id
    JOIN sections sec ON asch.section_id = sec.id
    JOIN grades g ON sec.grade_id = g.id
    JOIN activity_types at ON asch.activity = at.id
    WHERE asch.mentors_id = ? 
    AND asch.day = ?
    ORDER BY asch.start_time
  `;

  db.query(query, [mentorId, dayOfWeek], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      success: true,
      schedule: results
    });
  });
};

// Helper function to get day of week from date string (YYYY-MM-DD)
function getDayOfWeekFromDate(dateString) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

// Helper function to convert day-based schedule to date-based
function convertDayScheduleToDates(daySchedule) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)

  // Create a date map for the current week
  const dateMap = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + (i - currentDay));
    const dayName = daysOfWeek[date.getDay()];
    dateMap[dayName] = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  // Map the schedule to dates
  return daySchedule.map(item => {
    const date = dateMap[item.day];
    return {
      ...item,
      date,
      formattedDate: formatDateForDisplay(date) // You'll need to implement this
    };
  });
}

// Get mentor's section information
exports.getCoordinatorSection = (req, res) => {
  const { coordinatorId } = req.body;

  const query = `
    SELECT s.section_name
    FROM mentors m
    JOIN sections s ON m.section_id = s.id
    WHERE m.id = ?
  `;

  db.query(query, [coordinatorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      success: true,
      section: results[0]?.section_name || 'Not assigned'
    });
  });
};

// Submit leave request
exports.submitLeaveRequest = (req, res) => {
  const {
    phone, name, totalLeaveDays,
    leaveType, startDate, endDate, startTime, endTime, description
  } = req.body;

  if (!phone || !name || !leaveType || !startDate || !endDate || !description) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const values = [phone, name, totalLeaveDays, leaveType, startDate, endDate, startTime, endTime, description];

  const insertLeaveSql = `
    INSERT INTO facultyleaverequests (
      phone, name, total_leave_days,
      leave_type, start_date, end_date, start_time, end_time, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertLeaveSql, values, (err, result) => {
    if (err) {
      console.error('Error applying leave for mentor:', phone, err);
      return res.status(500).json({ success: false, message: 'Database error while submitting leave request' });
    }

    res.json({
      success: true,
      message: 'Leave request submitted successfully',
      leaveId: result.insertId
    });

  });
};

// Get leave history
exports.getLeaveHistory = (req, res) => {
  const { phone } = req.body;

  const query = `
    SELECT flr.id, flr.name, flr.phone, flr.leave_type, flr.start_date, flr.end_date, 
           flr.start_time, flr.end_time, flr.description, flr.status,
           flr.requested_at, flr.approved_at, flr.rejected_at, flr.total_leave_days,
           up.file_path
    FROM facultyleaverequests flr
    LEFT JOIN user_photos up ON flr.phone = up.phone
    WHERE flr.phone = ?
    ORDER BY requested_at DESC
  `;

  db.query(query, [phone], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      success: true,
      leaveRequests: results
    });

    // console.log(results);
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
    // console.log("Fetched doc types:", data);
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
  // console.log("Received gradeID:", req.body.gradeID);
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
  // console.log("Received gradeID:", (req.body.sectionID || gradeID));
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
  // console.log(`[GET] /api/coordinator/getMaterials?gradeID=${gradeID}&subjectID=${subjectID}`);

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
    // console.log(results);

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
  // console.log("Received gradeID:", req.body.gradeID);
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
    const { name, fatherName, dob, gender, grade, section, mobileNumber, mentorID } = req.body;
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

      // Check if user already exists
      const existingUser = await trx.query(
        `SELECT * FROM Users WHERE phone = ?`,
        [mobileNumber]
      );

      if (existingUser.length > 0) {
        // User exists - update roles if needed
        let roles = existingUser[0].roles;
        if (!roles.includes('Student')) {
          roles = roles + ',Student';
        }

        await trx.query(
          `UPDATE Users SET roles = ? WHERE phone = ?`,
          [roles, mobileNumber]
        );

        await trx.query(
          `INSERT INTO Students (name, dob, gender, section_id, father_mob, profile_photo, roll, mentor_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, dob, gender, section, mobileNumber, profilePhotoPath, rollNumber, mentorID ? mentorID : '0']
        );

        await trx.query(
          `INSERT INTO studentattendance (roll, total_days, on_duty_days, leave_days)
           VALUES (?, '1', '0', '0')`,
          [rollNumber]
        );
      }
      else {

        const hashedPassword = await bcrypt.hash(dob, 12);

        await trx.query(
          `INSERT INTO Users (name, email, phone, password_hash, roles)
           VALUES (?, ?, ?, ?, ?)`,
          [fatherName, `${rollNumber}.student@school.com`, mobileNumber, hashedPassword, 'Student']
        );

        await trx.query(
          `INSERT INTO Students (name, dob, gender, section_id, father_mob, profile_photo, roll, mentor_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, dob, gender, section, mobileNumber, profilePhotoPath, rollNumber, mentorID]
        );

        await trx.query(
          `INSERT INTO studentattendance (roll, total_days, on_duty_days, leave_days)
           VALUES (?, '1', '0', '0')`,
          [rollNumber]
        );
      }

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

exports.getSpecificSectionMentor = (req, res) => {

  const { sectionID } = req.body;

  const sql = `
    SELECT id from mentors WHERE section_id = ?;
  `;
  db.query(sql, [sectionID], (err, results) => {
    if (err) {
      console.error("Error fetching section mentor:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    // console.log(results);

    res.json({ success: true, message: "Section mentor fetched successfully", sectionMentor: results });
  });
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
    // console.log(countResult);
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
        await connection.query(
          `INSERT INTO facultyattendance (phone, total_days, on_duty_days, leave_days)
           VALUES (?, '1', '0', '0')`,
          [mobileNumber]
        )
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
// exports.createOrUpdateSchedule = async (req, res) => {
//   const { section_id, day, sessions } = req.body;

//   // Step 1: Delete previous sessions
//   const deleteSql = `
//     DELETE FROM academic_schedule WHERE section_id = ? AND day = ?
//   `;
//   db.query(deleteSql, [section_id, day], (err, results) => {
//     if (err) {
//       console.error("Error deleting previous sessions of section:", err);
//       return res.status(500).json({ success: false, message: 'Database error' });
//     }

//     // Step 2: Insert new sessions
//     const insertSessions = async () => {
//       for (const session of sessions) {
//         const { session_number, start_time, end_time, subject_id } = session;

//         const createSql = `
//           INSERT INTO academic_schedule (section_id, day, session_number, start_time, end_time, subject_id)
//           VALUES (?, ?, ?, ?, ?, ?)
//         `;
//         try {
//           await new Promise((resolve, reject) => {
//             db.query(createSql, [section_id, day, session_number, start_time, end_time, subject_id], (err, results) => {
//               if (err) {
//                 console.error("Error adding sessions of section:", err);
//                 reject(err);
//               }
//               resolve(results);
//             });
//           });
//         } catch (error) {
//           return res.status(500).json({ success: false, message: 'Database error' });
//         }
//       }

//       // Once all sessions are inserted, send a single response
//       res.status(200).json({ success: true, message: "Schedule added to section successfully" });
//     };

//     insertSessions();
//   });
// };

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

  const { activeSection } = req.body;

  const sql = `
    SELECT DISTINCT ssa.subject_id as id, sub.subject_name
    FROM section_subject_activities ssa
    JOIN Subjects sub ON ssa.subject_id = sub.id
    WHERE section_id = ?;
  `;
  db.query(sql, [activeSection], (err, results) => {
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

  const query = `
    SELECT ws.*, s.subject_name, u.name as mentor_name, at.activity_type as activity_name, ven.id as venue_id, ven.name as venue_name
    FROM weekly_schedule ws
    JOIN subjects s ON ws.subject_id = s.id
    LEFT JOIN mentors m ON ws.mentors_id = m.id
    LEFT JOIN users u ON m.phone = u.phone
    LEFT JOIN activity_types at ON ws.activity = at.id
    JOIN Venues ven ON ws.venue = ven.id
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

// Update venue status based on current schedule
exports.updateVenueStatusBasedOnSchedule = () => {
  const now = new Date();
  const currentDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  const currentTime = now.toTimeString().substring(0, 8);

  const query = `
    SELECT venue 
    FROM weekly_schedule 
    WHERE day = ? 
    AND start_time <= ? 
    AND end_time >= ?
    AND venue IS NOT NULL`;

  db.query(query, [currentDay, currentTime, currentTime], (err, results) => {
    if (err) {
      console.error('Error checking active sessions:', err);
      return;
    }

    const activeVenueIds = results.map(r => r.venue);
    const placeholders = activeVenueIds.length > 0 
      ? activeVenueIds.map(() => '?').join(',') 
      : 'NULL';

    const updateQuery = `
      UPDATE venues 
      SET status = CASE 
        WHEN id IN (${placeholders}) THEN 'Active' 
        ELSE 'InActive' 
      END`;
    
    db.query(updateQuery, activeVenueIds, (err) => {
      if (err) {
        console.error('Error updating venue statuses:', err);
      }
    });
  });
};


// Check for time conflicts in schedule
exports.checkTimeConflict = (req, res) => {
  const { sectionId, day, startTime, endTime, excludeId } = req.query;

  const query = `
    SELECT COUNT(*) as conflictCount
    FROM weekly_schedule
    WHERE section_id = ? 
    AND day = ?
    AND (
      (start_time < ? AND end_time > ?) OR
      (start_time < ? AND end_time > ?) OR
      (start_time >= ? AND end_time <= ?)
    )
    ${excludeId ? 'AND id != ?' : ''}`;

  const params = [sectionId, day, endTime, startTime, endTime, startTime, startTime, endTime];
  if (excludeId) params.push(excludeId);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ 
      success: true, 
      hasConflict: results[0].conflictCount > 0 
    });
  });
};

// Call this function periodically (e.g., every 5 minutes)
setInterval(() => {
  exports.updateVenueStatusBasedOnSchedule();
}, 1 * 60 * 1000); // 5 minutes

// Add or update a schedule item
exports.addOrUpdateWeeklySchedule = (req, res) => {
  const { id, sectionId, day, startTime, endTime, subjectId, mentorsId, activity, venue } = req.body;

  if (!sectionId || !day || !startTime || !endTime || !subjectId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // If we have an ID, this is an update - use UPDATE query
  if (id) {
    const updateQuery = `
      UPDATE weekly_schedule 
      SET 
        section_id = ?,
        day = ?,
        start_time = ?,
        end_time = ?,
        subject_id = ?,
        mentors_id = ?,
        activity = ?,
        venue = ?
      WHERE id = ?`;

    db.query(updateQuery,
      [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null, id],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        exports.updateVenueStatusBasedOnSchedule();
        res.json({
          success: true,
          message: 'Schedule item updated successfully',
          id: id
        });
      });
  } 
  // Otherwise, this is a new record - use INSERT
  else {
    const insertQuery = `
      INSERT INTO weekly_schedule 
      (section_id, day, start_time, end_time, subject_id, mentors_id, activity, venue)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(insertQuery,
      [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        exports.updateVenueStatusBasedOnSchedule();
        res.json({
          success: true,
          message: 'Schedule item created successfully',
          id: results.insertId
        });
      });
  }
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
  const { subjectId, activeSection } = req.query;
  // console.log(subjectId, activeSection);
  

  const query = `
    SELECT m.id, u.name, m.roll
    FROM mentor_section_assignments msa
    JOIN section_mentor_subject sms ON msa.id = sms.msa_id
    JOIN Mentors m ON msa.mentor_id = m.id
    JOIN users u ON m.phone = u.phone
    WHERE sms.section_id = ? AND msa.subject_id = ?`;

  db.query(query, [activeSection, subjectId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, mentors: results });
  });
};

//Get Section Activities
exports.getSectionSubjectActivities = (req, res) => {

  const {subjectId, activeSection} = req.query;

  // console.log(subjectId, activeSection);
  

  const sql = `
    SELECT ssa.activity_type as id, at.activity_type as activity_name
    FROM section_subject_activities ssa
    JOIN Activity_types at ON ssa.activity_type = at.id
    WHERE ssa.subject_id = ? AND ssa.section_id = ?
  `;
  db.query(sql,[subjectId, activeSection], (err, results) => {
    if (err) {
      console.error("Error fetching section subject activity types:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    // console.log(results);
    
    res.json({ success: true, message: "Activity types fetched successfully", activity_types: results });
  });
};

//Students Page
exports.getSectionStudents = (req, res) => {
  const { sectionID } = req.body;
  // console.log("Received gradeID:", req.body.gradeID);
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
  const { mentor_id, grade_id } = req.body;

  try {
    // Step 1: Get all sections for the grade
    const sections = await db.promise().query(
      'SELECT id FROM Sections WHERE grade_id = ?',
      [grade_id]
    );

    let assignedSectionId = null;

    // Step 2: Check for an unassigned section
    for (const section of sections) {
      const mentorCheck = await db.promise().query(
        'SELECT id FROM Mentors WHERE section_id = ?',
        [section.id]
      );
      if (mentorCheck.length === 0) {
        assignedSectionId = section.id;
        break;
      }
    }

    // Step 3: If no unassigned section found, create a new one
    if (!assignedSectionId) {
      const newSectionName = `Section ${String.fromCharCode(65 + sections.length)}`; // A, B, C, ...
      const createResult = await db.promise().query(
        'INSERT INTO Sections (section_name, grade_id) VALUES (?, ?)',
        [newSectionName, grade_id]
      );
      assignedSectionId = createResult.insertId;
    }

    // Step 4: Assign mentor to the section
    await db.promise().query(
      'UPDATE Mentors SET section_id = ?, grade_id = ? WHERE id = ?',
      [assignedSectionId, grade_id, mentor_id]
    );

    // Step 5: Update students in the section
    await db.promise().query(
      'UPDATE Students SET mentor_id = ? WHERE section_id = ?',
      [mentor_id, assignedSectionId]
    );

    res.json({
      success: true,
      message: 'Mentor assigned to section successfully',
      section_id: assignedSectionId
    });

  } catch (error) {
    console.error('Error assigning mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Database error'
    });
  }
};


exports.createSection = async (req, res) => {
  const { name, grade_id } = req.body;
  try {
    const result = await db.promise().query(
      'INSERT INTO Sections (section_name, grade_id) VALUES (?, ?)',
      [name, grade_id]
    );
    res.json({ success: true, section_id: result.insertId });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ success: false, message: 'Section creation failed' });
  }
};

exports.getMentorSectionStudents = (req, res) => {
  const { sectionID, mentorID } = req.body;

  const sql = `
    SELECT st.id, st.name, st.roll, st.profile_photo
    FROM Students st
    WHERE st.mentor_id = ?
  `;
  db.query(sql, [mentorID], (err, results) => {
    if (err) {
      console.error("Error fetching student data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Student data fetched successfully", sectionStudents: results });
  });
};

exports.remomveMentorStudents = (req, res) => {
  const { mentorID, studentID } = req.body;

  const sql = `
    UPDATE Students set mentor_id = NULL WHERE id = ?;
  `;
  db.query(sql, [mentorID, studentID], (err, results) => {
    if (err) {
      console.error("Error fetching grade subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Subject data fetched successfully", mentorGradeSubjects: results });
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

// Get subjects for a grade (updated to show assigned mentors)
exports.getGradeSubjects = (req, res) => {
  const { sectionID } = req.body;

  const sql = `
    SELECT 
      sub.id AS subject_id, 
      sub.subject_name,
      GROUP_CONCAT(DISTINCT CONCAT(u.name, ' (', m.roll, ')') 
        ORDER BY 
          CASE WHEN sms.section_id = ? THEN 0 ELSE 1 END,
          u.name
        SEPARATOR ', '
      ) AS assigned_mentors,
      GROUP_CONCAT(DISTINCT 
        CASE WHEN sms.section_id = ? THEN CONCAT(u.name, '|', m.roll, '|', up.file_path) ELSE NULL END
        SEPARATOR '|'
      ) AS section_mentor_info
    FROM section_subject_activities ss
    JOIN subjects sub ON ss.subject_id = sub.id
    LEFT JOIN mentor_section_assignments msa ON sub.id = msa.subject_id 
      AND (SELECT grade_id FROM sections WHERE id = ?) = msa.grade_id
    LEFT JOIN mentors m ON msa.mentor_id = m.id
    LEFT JOIN users u ON m.phone = u.phone
    LEFT JOIN user_photos up ON m.phone = up.phone
    LEFT JOIN section_mentor_subject sms ON msa.id = sms.msa_id AND sms.section_id = ?
    WHERE ss.section_id = ?
    GROUP BY sub.id, sub.subject_name;
  `;

  db.query(sql, [sectionID, sectionID, sectionID, sectionID, sectionID], (err, results) => {
    if (err) {
      console.error("Error fetching grade subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({
      success: true,
      message: "Subject data fetched successfully",
      mentorSubjects: results.map(subject => ({
        ...subject,
        // Extract the first mentor assigned to this specific section
        sectionMentorName: subject.section_mentor_info ? subject.section_mentor_info.split('|')[0] : null,
        sectionMentorRoll: subject.section_mentor_info ? subject.section_mentor_info.split('|')[1] : null,
        sectionMentorPhoto: subject.section_mentor_info ? subject.section_mentor_info.split('|')[2] : null
      }))
    });
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


// Assign mentor to subject at grade level

// Get enrolled subject mentors for a grade and subject
exports.getEnroledGradeSubjectMentor = (req, res) => {
  const { gradeID, subjectID } = req.body;

  const sql = `
    SELECT DISTINCT
      m.id AS mentor_id,
      u.name,
      m.specification,
      m.roll,
      up.file_path,
      GROUP_CONCAT(DISTINCT sms.section_id) AS assigned_section_ids
    FROM mentor_section_assignments msa
    JOIN mentors m ON msa.mentor_id = m.id
    LEFT JOIN user_photos up ON m.phone = up.phone
    JOIN users u ON m.phone = u.phone
    LEFT JOIN section_mentor_subject sms ON msa.id = sms.msa_id
    WHERE msa.grade_id = ? AND msa.subject_id = ?
    GROUP BY m.id, u.name, m.specification, m.roll, up.file_path
    ORDER BY m.roll;
  `;

  db.query(sql, [gradeID, subjectID], (err, results) => {
    if (err) {
      console.error("Error fetching grade mentor data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({
      success: true,
      message: "Mentor data fetched successfully",
      enroledGradeSubjectMentor: results.map(mentor => ({
        ...mentor,
        assigned_section_ids: mentor.assigned_section_ids ? mentor.assigned_section_ids.split(',') : []
      }))
    });
  });
};

exports.assignMentorToSubject = (req, res) => {
  const { mentor_id, subject_id, grade_id } = req.body;

  // First check if this mentor is already assigned to this subject-grade combination
  const checkSql = `
    SELECT id FROM mentor_section_assignments 
    WHERE mentor_id = ? AND subject_id = ? AND grade_id = ?
  `;

  db.query(checkSql, [mentor_id, subject_id, grade_id], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking existing assignment:', checkErr);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (checkResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mentor is already assigned to this subject for this grade'
      });
    }

    // Insert new assignment
    const insertSql = `
      INSERT INTO mentor_section_assignments 
      (mentor_id, subject_id, grade_id) 
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [mentor_id, subject_id, grade_id], (insertErr, insertResult) => {
      if (insertErr) {
        console.error('Error assigning mentor:', insertErr);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      res.json({
        success: true,
        message: 'Mentor assigned to subject successfully',
        assignmentId: insertResult.insertId
      });
    });
  });
};

// Assign subject mentor to a section
exports.assignSubjectToMentorSection = (req, res) => {
  const { mentor_id, subject_id, grade_id, section_id } = req.body;

  // First get the msa_id (mentor-subject-grade assignment)
  const getMsaSql = `
    SELECT id FROM mentor_section_assignments 
    WHERE mentor_id = ? AND subject_id = ? AND grade_id = ?
  `;

  db.query(getMsaSql, [mentor_id, subject_id, grade_id], (msaErr, msaResults) => {
    if (msaErr) {
      console.error('Error getting mentor assignment:', msaErr);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (msaResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mentor is not assigned to this subject for this grade'
      });
    }

    const msa_id = msaResults[0].id;

    // Check if this mentor is already assigned to this section for this subject
    const checkSql = `
      SELECT id FROM section_mentor_subject 
      WHERE msa_id = ? AND section_id = ?
    `;

    db.query(checkSql, [msa_id, section_id], (checkErr, checkResults) => {
      if (checkErr) {
        console.error('Error checking existing section assignment:', checkErr);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (checkResults.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Mentor is already assigned to this section for this subject'
        });
      }

      // Insert new section assignment
      const insertSql = `
        INSERT INTO section_mentor_subject 
        (msa_id, section_id) 
        VALUES (?, ?)
      `;

      db.query(insertSql, [msa_id, section_id], (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error assigning mentor to section:', insertErr);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({
          success: true,
          message: 'Mentor assigned to section successfully'
        });
      });
    });
  });
};

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


//Calendar Page
// Get calendar events for a month
exports.getCalendarEvents = (req, res) => {
  const { year, month } = req.query;

  // Validate inputs
  if (!year || !month) {
    return res.status(400).json({ success: false, message: 'Year and month are required' });
  }

  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;

  const sql = `
    SELECT * FROM calendar_events 
    WHERE date BETWEEN ? AND LAST_DAY(?)
    ORDER BY date, start_time
  `;

  db.query(sql, [startDate, startDate], (err, results) => {
    if (err) {
      console.error("Error fetching calendar events:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Format dates for frontend
    const formattedEvents = results.map(event => ({
      ...event,
      date: new Date(event.date),
      start_time: event.start_time ? event.start_time.substring(0, 5) : null,
      end_time: event.end_time ? event.end_time.substring(0, 5) : null
    }));

    res.json({ success: true, events: formattedEvents });
  });
};

// Add new calendar event
exports.addCalendarEvent = (req, res) => {
  const { type, name, start_time, end_time, date } = req.body;

  // Basic validation
  if (!type || !name || !date) {
    return res.status(400).json({ success: false, message: 'Type, name and date are required' });
  }

  if (type === 'event' && (!start_time || !end_time)) {
    return res.status(400).json({ success: false, message: 'Start and end time are required for events' });
  }

  const sql = `
    INSERT INTO calendar_events 
    (type, name, start_time, end_time, date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [type, name, start_time, end_time, date], (err, result) => {
    if (err) {
      console.error("Error adding calendar event:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({
      success: true,
      message: 'Event added successfully',
      eventId: result.insertId
    });
  });
};

// Delete calendar event
exports.deleteCalendarEvent = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Event ID is required' });
  }

  const sql = 'DELETE FROM calendar_events WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error deleting calendar event:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  });
};