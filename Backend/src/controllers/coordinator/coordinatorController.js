const db = require('../../config/db');
const { createAcademicSessionsByDate } = require('../mentor/mentorController');

exports.getCoordinatorData = (req, res) => {
  const { phoneNumber } = req.body;
  const sql = `
    SELECT c.id AS id, c.roll, c.phone, u.name, up.file_path
    FROM Coordinators c
    JOIN Users u ON c.phone = u.phone
    JOIN User_photos up ON c.phone = up.phone
    WHERE c.phone = ?;
  `;
  db.query(sql, [phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, coordinatorData: results[0] });
  });
};

exports.getCoordinatorGrades = (req, res) => {
  const { coordinatorId } = req.body;
  const sql = `
    SELECT cga.id, cga.grade_id FROM coordinator_grade_assignments cga WHERE cga.coordinator_id = ?;
  `;
  db.query(sql, [coordinatorId], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    // console.log(results);

    res.json({ success: true, coordinatorGrades: results });
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
//StudentIssueLogs
exports.addStudentComplaint = async (req, res) => {
  const { roll, complaint, registeredBy } = req.body;
  // console.log(roll);


  if (!roll || !complaint || !registeredBy) {
    return res.status(400).json({ success: false, message: "Phone and complaint are required." });
  }

  try {
    const trx = await db.promise().beginTransaction();

    const faculty = await trx.query(
      `SELECT name FROM users WHERE phone = ?`,
      [registeredBy]
    );

    if (faculty.length === 0) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: "Registering faculty not found." });
    }

    const registeredByName = faculty[0].name;

    await trx.query(
      `INSERT INTO student_dicipline (roll, complaint, registered_by_phone, registered_by_name)
       VALUES (?, ?, ?, ?)`,
      [roll, complaint, registeredBy, registeredByName]
    );

    await trx.commit();
    res.status(200).json({ success: true, message: "Complaint submitted successfully." });

  } catch (error) {
    console.error("Error adding complaint:", error);
    res.status(500).json({ success: false, message: "Failed to submit complaint." });
  }
};


exports.getStudentDisciplineLogs = async (req, res) => {
  const { sectionId } = req.query;
  try {
    const [rows] = await db.promise().query(`
      SELECT sd.*, s.name as student_name, s.profile_photo, sd.roll
      FROM student_dicipline sd
      JOIN Students s ON sd.roll = s.roll
      WHERE s.section_id = ?
      ORDER BY sd.registered_at DESC;
    `, [sectionId]);

    res.status(200).json({ success: true, logs: rows });
  } catch (error) {
    console.error("Error fetching discipline logs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs." });
  }
};


exports.getStudentList = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT s.name as student_name, s.roll, s.section_id, sec.section_name, sec.grade_id
      FROM Students s
      JOIN Sections sec ON s.section_id = sec.id
      ORDER BY s.name
    `);

    res.status(200).json({ success: true, student: rows });
  } catch (error) {
    console.error("Error fetching student list:", error);
    res.status(500).json({ success: false, message: "Failed to fetch student." });
  }
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
  const { phone } = req.body;

  const query = `
    SELECT COUNT(*) AS count
    FROM faculty_dicipline
    WHERE phone = ?
  `;

  db.query(query, [phone], (err, results) => {
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

  const query = `
      SELECT 
      ds.id,
      ds.date,
      ds.start_time,
      ds.end_time,
      s.subject_name,
      ds.subject_id,
      sec.section_name ,
      ds.section_id,
      sec.grade_id,
      avt.activity_type AS activity_name,
      v.name AS venue
    FROM daily_schedule ds
    JOIN subjects s ON ds.subject_id = s.id
    JOIN sections sec ON ds.section_id = sec.id
    LEFT JOIN activity_types avt ON ds.activity = avt.id
    LEFT JOIN venues v ON ds.venue = v.id
    WHERE ds.mentors_id = ? AND ds.date = ?
    ORDER BY ds.start_time
  `;

  db.query(query, [mentorId, date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({
      success: true,
      schedule: results
    });
    console.log(results);

  });
};

//MentorSubstitution
// Get available mentors for substitution
exports.getAvailableMentorsForSubstitution = async (req, res) => {
  try {
    const { sectionId, date, startTime, endTime, currentMentorId } = req.body;

    // Check for mentors who don't have sessions during this time
    const query = `
      SELECT m.id, m.roll, m.phone, u.name, m.specification 
      FROM mentors m
      JOIN users u ON m.phone = u.phone
      WHERE m.id != ? 
      AND m.id NOT IN (
        SELECT mentors_id 
        FROM daily_schedule 
        WHERE date = ? 
        AND (
          (start_time < ? AND end_time > ?) OR
          (start_time >= ? AND start_time < ?) OR
          (end_time > ? AND end_time <= ?)
        )
      `;

    const [availableMentors] = await db.promise().query(query, [
      currentMentorId,
      date,
      endTime, startTime,
      startTime, endTime,
      startTime, endTime
    ]);

    res.json({ success: true, availableMentors });
  } catch (error) {
    console.error('Error fetching available mentors:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch available mentors' });
  }
};

// Update mentor substitution
exports.updateMentorSubstitution = async (req, res) => {
  try {
    const { scheduleId, newMentorId } = req.body;

    // Update the daily_schedule table
    const updateQuery = 'UPDATE daily_schedule SET mentors_id = ? WHERE id = ?';
    await db.promise().query(updateQuery, [newMentorId, scheduleId]);

    res.json({ success: true, message: 'Mentor substituted successfully' });
  } catch (error) {
    console.error('Error substituting mentor:', error);
    res.status(500).json({ success: false, error: 'Failed to substitute mentor' });
  }
};

// // Helper function to get day of week from date string (YYYY-MM-DD)
// function getDayOfWeekFromDate(dateString) {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   const date = new Date(dateString);
//   return days[date.getDay()];
// }

// // Helper function to convert day-based schedule to date-based
// function convertDayScheduleToDates(daySchedule) {
//   const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   const today = new Date();
//   const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)

//   // Create a date map for the current week
//   const dateMap = {};
//   for (let i = 0; i < 7; i++) {
//     const date = new Date(today);
//     date.setDate(today.getDate() + (i - currentDay));
//     const dayName = daysOfWeek[date.getDay()];
//     dateMap[dayName] = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
//   }

//   // Map the schedule to dates
//   return daySchedule.map(item => {
//     const date = dateMap[item.day];
//     return {
//       ...item,
//       date,
//       formattedDate: formatDateForDisplay(date) // You'll need to implement this
//     };
//   });
// }

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
      const newFilePath = path.join('./uploads/documents', `${fileId}.pdf`);

      // Rename/move the file to ensure .pdf extension
      fs.renameSync(file.path, path.join(__dirname, '../../..', newFilePath));

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
    SELECT 
      ssa.id as section_subject_activity_id,
      sub.id AS subject_id, 
      sub.subject_name,
      at.id as activity_id,
      at.activity_type as activity_name
    FROM section_subject_activities ssa
    JOIN sections sec ON ssa.section_id = sec.id
    JOIN subjects sub ON ssa.subject_id = sub.id
    LEFT JOIN activity_types at ON ssa.activity_type = at.id
    WHERE sec.grade_id = ?
    ORDER BY sub.subject_name, at.activity_type;
  `;
  db.query(sql, [gradeID], (err, results) => {
    if (err) {
      console.error("Error fetching grade subjects data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    // Group results by subject
    const groupedSubjects = results.reduce((acc, row) => {
      const existingSubject = acc.find(subj => subj.subject_id === row.subject_id);
      
      if (existingSubject) {
        existingSubject.activities.push({
          section_subject_activity_id: row.section_subject_activity_id,
          activity_id: row.activity_id,
          activity_name: row.activity_name
        });
      } else {
        acc.push({
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          activities: [{
            section_subject_activity_id: row.section_subject_activity_id,
            activity_id: row.activity_id,
            activity_name: row.activity_name
          }]
        });
      }
      return acc;
    }, []);

    res.json({ success: true, message: "Subject data fetched successfully", gradeSubjects: groupedSubjects });
  });
};

exports.uploadStudyMaterial = async (req, res) => {
  const { section_subject_activity_id, level, expected_date, title } = req.body;
  let connection;

  try {
    const uploadDir = path.join(__dirname, '../../../', 'uploads', 'materials');
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
      const absolutePath = path.join(__dirname, '../../../', relativePath);

      // Move file to /uploads/materials
      fs.renameSync(file.path, absolutePath);

      const materialType = file.mimetype.includes('video') ? 'Video' : 'PDF';

      await connection.query(
        `INSERT INTO Materials 
         (section_subject_activity_id, level, title, material_type, file_name, file_url, expected_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          section_subject_activity_id,
          level,
          title || null,
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
  const { section_subject_activity_id } = req.query;

  if (!section_subject_activity_id) {
    return res.status(400).json({ error: 'Missing section_subject_activity_id' });
  }

  const sql = `
    SELECT m.*, ssa.subject_id, ssa.section_id, s.subject_name, at.activity_type 
    FROM materials m
    JOIN section_subject_activities ssa ON m.section_subject_activity_id = ssa.id
    JOIN subjects s ON ssa.subject_id = s.id
    LEFT JOIN activity_types at ON ssa.activity_type = at.id
    WHERE m.section_subject_activity_id = ?
    ORDER BY m.level
  `;
  db.query(sql, [section_subject_activity_id], (err, results) => {
    if (err) {
      console.error("Error fetching materials data:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Materials data fetched successfully", materials: results });
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
    const absolutePath = path.join(__dirname, '../../../', filePath);

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
  const { level, section_subject_activity_id } = req.body;

  const getFileQuery = 'SELECT file_url FROM Materials WHERE level = ? AND section_subject_activity_id = ?';
  db.query(getFileQuery, [level, section_subject_activity_id], (err, results) => {
    if (err) {
      console.error('Fetch files error:', err);
      return res.status(500).json({ success: false, message: 'Server error while fetching materials' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No materials found for the given level' });
    }

    // Delete all matching files from the file system
    results.forEach((row) => {
      const filePath = path.join(__dirname, '../../../', row.file_url);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) {
          console.error(`ÔØî Error deleting file ${filePath}:`, fsErr.message);
        } else {
          console.log(`Ô£à Deleted file: ${filePath}`);
        }
      });
    });

    // Delete all matching records from the DB
    const deleteQuery = 'DELETE FROM Materials WHERE level = ? AND section_subject_activity_id = ?';
    db.query(deleteQuery, [level, section_subject_activity_id], (err, result) => {
      if (err) {
        console.error('Delete level error:', err);
        return res.status(500).json({ success: false, message: 'Server error while deleting materials' });
      }

      return res.json({ success: true, message: 'All files and DB records for this level deleted successfully' });
    });
  });
};

exports.updateExpectedDate = (req, res) => {
  const { level, section_subject_activity_id, expected_date } = req.body;

  const sql = `
    UPDATE Materials
    SET expected_date = ?
    WHERE level = ? AND section_subject_activity_id = ?
  `;

  db.query(sql, [expected_date, level, section_subject_activity_id], (err, result) => {
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
const { createTodayAcademicSessions } = require('../mentor/mentorController');
const { log } = require('console');

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

    let studentCount = studentCountResult[0].student_count || 0;
    studentCount++; // new student

    const rollNumber = `S${grade}${(1000 + studentCount).toString().substring(1)}`;
    // console.log(studentCount);


    const trx = await con.beginTransaction();

    try {

      // Check if user already exists
      const existingUser = await trx.query(
        `SELECT * FROM Users WHERE phone = ?`,
        [mobileNumber]
      );

      const getSectionSubjects = await trx.query(
        `SELECT DISTINCT subject_id FROM section_subject_activities WHERE section_id = ?`,
        [section]
      );
      const subjectIDs = getSectionSubjects.map(subject => subject.subject_id);
      // console.log("Subject IDs:", subjectIDs);

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
          `INSERT INTO studentattendance (roll, total_days, on_duty, leave_days)
           VALUES (?, '1', '0', '0')`,
          [rollNumber]
        );

        // Insert into student_subjects table
        for (const subjectID of subjectIDs) {
          await trx.query(
            `INSERT INTO student_levels (student_roll, subject_id, level, section_id, status)
           VALUES (?, ?, ?, ?, ?)`,
            [rollNumber, subjectID, '1', section, 'OnGoing']
          );
        }
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
          `INSERT INTO studentattendance (roll, total_days, on_duty, leave_days)
           VALUES (?, '1', '0', '0')`,
          [rollNumber]
        );

        for (const subjectID of subjectIDs) {
          await trx.query(
            `INSERT INTO student_levels (student_roll, subject_id, level, section_id, status)
           VALUES (?, ?, ?, ?, ?)`,
            [rollNumber, subjectID, '1', section, 'OnGoing']
          );
        }
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
    // 1. Get mentor count safely
    const [countResult] = await con.query(`SELECT COUNT(*) AS mentor_count FROM Mentors`);

    const mentorCountRaw = countResult?.[0]?.mentor_count;
    const mentorCount = Number(mentorCountRaw);

    if (isNaN(mentorCount)) {
      console.error('❌ Invalid mentor count:', mentorCountRaw);
      throw new Error('Mentor count is invalid, cannot generate roll');
    }

    // 2. Add 1 to get new roll number
    const nextMentorNumber = mentorCount + 1;

    // 3. Generate formatted roll
    const newRoll = `M${String(nextMentorNumber).padStart(3, '0')}`;

    console.log('✅ New mentor roll:', newRoll);
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
// exports.getSchedule = async (req, res) => {
//   const { section_id, day } = req.params;

//   const sql = `
//     SELECT 
//         a.id, 
//         a.section_id, 
//         a.day,  
//         a.session_number, 
//         TIME_FORMAT(a.start_time, '%h:%i %p') as start_time, 
//         TIME_FORMAT(a.end_time, '%h:%i %p') as end_time, 
//         a.subject_id,
//         s.subject_name
//       FROM academic_schedule a
//       JOIN subjects s ON a.subject_id = s.id
//       WHERE a.section_id = ? AND a.day = ?
//       ORDER BY a.session_number
//   `;
//   db.query(sql, [section_id, day], (err, results) => {
//     if (err) {
//       console.error("Error fetching academic schedule:", err);
//       return res.status(500).json({ success: false, message: 'Database error' });
//     }

//     res.json({ success: true, message: "Academic schedule fetched", sessions: results });
//   });
// };

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

  console.log('Received grade_id:', grade_id); // Add debugging

  if (!grade_id) {
    return res.status(400).json({ 
      success: false, 
      message: 'grade_id is required' 
    });
  }

  const sql = `
    SELECT 
      es.id, 
      es.grade_id, 
      es.subject_id, 
      es.exam_date AS date,
      TIME_FORMAT(es.start_time, '%h:%i %p') AS start_time,
      TIME_FORMAT(es.end_time, '%h:%i %p') AS end_time,
      ANY_VALUE(s.subject_name) AS subject,
      GROUP_CONCAT(i.mentor_id) AS invigilator_ids,
      GROUP_CONCAT(u.name) AS invigilator_names,
      ANY_VALUE(g.grade_name) AS grade_name
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
      return res.status(500).json({ 
        success: false, 
        message: 'Database error',
        error: err.message 
      });
    }

    console.log('Raw query results:', results); // Add debugging

    if (!results || results.length === 0) {
      return res.json({ 
        success: true, 
        exams: [],
        message: 'No exams found for this grade' 
      });
    }

    // Transform the results to match the frontend format
    const formattedResults = results.map(exam => {
      console.log('Processing exam:', exam); // Add debugging
      
      return {
        id: exam.id,
        subject: exam.subject || 'Unknown Subject',
        date: exam.date,
        time: `${exam.start_time || ''} - ${exam.end_time || ''}`,
        grade: exam.grade_name || '',
        invigilators: exam.invigilator_ids ? 
          exam.invigilator_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
        invigilatorNames: exam.invigilator_names ? 
          exam.invigilator_names.split(',').map(name => name.trim()) : [],
        color: '#6A5ACD'
      };
    });

    console.log('Formatted results:', formattedResults); // Add debugging

    res.json({ 
      success: true, 
      exams: formattedResults,
      count: formattedResults.length
    });
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

    console.log(results);
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

// exports.addOrUpdateWeeklySchedule = (req, res) => {
//   const { id, sectionId, day, startTime, endTime, subjectId, mentorsId, activity, venue } = req.body;

//   if (!sectionId || !day || !startTime || !endTime || !subjectId) {
//     return res.status(400).json({ success: false, message: 'Missing required fields' });
//   }

//   // If we have an ID, this is an update - use UPDATE query
//   if (id) {
//     const updateQuery = `
//       UPDATE weekly_schedule 
//       SET 
//         section_id = ?,
//         day = ?,
//         start_time = ?,
//         end_time = ?,
//         subject_id = ?,
//         mentors_id = ?,
//         activity = ?,
//         venue = ?
//       WHERE id = ?`;

//     db.query(updateQuery,
//       [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null, id],
//       (err, results) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({ success: false, message: 'Database error' });
//         }

//         exports.updateVenueStatusBasedOnSchedule();
//         res.json({
//           success: true,
//           message: 'Schedule item updated successfully',
//           id: id
//         });
//       });
//   }
//   // Otherwise, this is a new record - use INSERT
//   else {
//     const insertQuery = `
//       INSERT INTO weekly_schedule 
//       (section_id, day, start_time, end_time, subject_id, mentors_id, activity, venue)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//     db.query(insertQuery,
//       [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null],
//       (err, results) => {
//         if (err) {
//           console.error(err);
//           return res.status(500).json({ success: false, message: 'Database error' });
//         }

//         exports.updateVenueStatusBasedOnSchedule();
//         res.json({
//           success: true,
//           message: 'Schedule item created successfully',
//           id: results.insertId
//         });
//       });
//   }
// };

// exports.addOrUpdateWeeklySchedule = async (req, res) => {
//   const { id, sectionId, day, startTime, endTime, subjectId, mentorsId, activity, venue } = req.body;

//   if (!sectionId || !day || !startTime || !endTime || !subjectId) {
//     return res.status(400).json({ success: false, message: 'Missing required fields' });
//   }

//   try {
//     // If we have an ID, this is an update - use UPDATE query
//     if (id) {
//       const updateQuery = `
//         UPDATE weekly_schedule 
//         SET 
//           section_id = ?,
//           day = ?,
//           start_time = ?,
//           end_time = ?,
//           subject_id = ?,
//           mentors_id = ?,
//           activity = ?,
//           venue = ?
//         WHERE id = ?`;

//       await db.promise().query(updateQuery,
//         [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null, id]);

//       // Regenerate future daily schedules based on this change
//       await regenerateFutureDailySchedules(id);

//       exports.updateVenueStatusBasedOnSchedule();
//       return res.json({
//         success: true,
//         message: 'Schedule item updated successfully',
//         id: id
//       });
//     }
//     // Otherwise, this is a new record - use INSERT
//     else {
//       const insertQuery = `
//         INSERT INTO weekly_schedule 
//         (section_id, day, start_time, end_time, subject_id, mentors_id, activity, venue)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//       const results = await db.promise().query(insertQuery,
//         [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null]);

//       // Generate daily schedules for future dates
//       await generateDailySchedulesFromWeekly(results.insertId);

//       exports.updateVenueStatusBasedOnSchedule();
//       return res.json({
//         success: true,
//         message: 'Schedule item created successfully',
//         id: results.insertId
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: 'Database error' });
//   }
// };

exports.addOrUpdateWeeklySchedule = async (req, res) => {
  const { id, sectionId, day, startTime, endTime, subjectId, mentorsId, activity, venue } = req.body;

  if (!sectionId || !day || !startTime || !endTime || !subjectId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Step 1: Calculate session_no
    const [existingSessions] = await db.promise().query(
      `SELECT COUNT(*) AS count FROM weekly_schedule 
       WHERE section_id = ? AND day = ? AND start_time < ?`,
      [sectionId, day, startTime]
    );
    const sessionNo = existingSessions[0].count + 1;
    // console.log("weekly",id);

    // Step 2: Update existing schedule
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
          venue = ?,
          session_no = ?
        WHERE id = ?`;


      await db.promise().query(updateQuery,
        [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null, sessionNo, id]);
      // await db.promise().query(updateAcademicSessionsQuery,
      //   [id]);

      await regenerateFutureDailySchedules(id);
      exports.updateVenueStatusBasedOnSchedule();
      await regenerateFutureDailySchedules(id);
      // ✅ Sync academic sessions
      const today = new Date().toISOString().split('T')[0];
      await createAcademicSessionsByDate(today);

      return res.json({
        success: true,
        message: 'Schedule item updated successfully',
        id: id
      });
    }
    // Step 3: Insert new schedule
    else {
      const insertQuery = `
        INSERT INTO weekly_schedule 
        (section_id, day, start_time, end_time, subject_id, mentors_id, activity, venue, session_no)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const [results] = await db.promise().query(insertQuery,
        [sectionId, day, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null, sessionNo]);

      await generateDailySchedulesFromWeekly(results.insertId);
      await generateAcademicSessionsForNextNDays();
      exports.updateVenueStatusBasedOnSchedule();
      return res.json({
        success: true,
        message: 'Schedule item created successfully',
        id: results.insertId
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

async function generateAcademicSessionsForNextNDays(days = 20) {
  let totalCreated = 0;
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const formattedDate = date.toISOString().split('T')[0];
    const created = await createAcademicSessionsByDate(formattedDate);
    totalCreated += created;
  }
  return totalCreated;
}

// New endpoint for daily adjustments
exports.adjustDailySchedule = async (req, res) => {
  const { date, sectionId, originalScheduleId, startTime, endTime, subjectId, mentorsId, activity, venue } = req.body;

  try {
    // First check if an adjusted schedule already exists for this date
    const [existing] = await db.promise().query(
      `SELECT id FROM daily_schedule 
       WHERE date = ? AND section_id = ? AND original_schedule_id = ? AND is_adjusted = 1`,
      [date, sectionId, originalScheduleId]
    );

    if (existing) {
      // Update existing adjustment
      await db.promise().query(
        `UPDATE daily_schedule SET
          start_time = ?,
          end_time = ?,
          subject_id = ?,
          mentors_id = ?,
          activity = ?,
          venue = ?
        WHERE id = ? AND status = 'Active'`,
        [startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null, existing.id]
      );
    } else {
      // Create new adjustment
      await db.promise().query(
        `INSERT INTO daily_schedule 
        (section_id, date, start_time, end_time, subject_id, mentors_id, activity, venue, is_adjusted, original_schedule_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [sectionId, date, startTime, endTime, subjectId, mentorsId || null, activity || null, venue || null, originalScheduleId]
      );
    }

    exports.updateVenueStatusBasedOnSchedule();
    return res.json({ success: true, message: 'Daily schedule adjusted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

// Helper function to generate daily schedules from weekly template
async function generateDailySchedulesFromWeekly(weeklyScheduleId) {


  // Get the weekly schedule template
  const [rows] = await db.promise().query('SELECT * FROM weekly_schedule WHERE id = ?', [weeklyScheduleId]);
  const weekly = rows[0];

  if (!weekly) return;
  // console.log("Raw weekly.day:", weekly.day);
  // Find all future dates that match this day of week
  const today = new Date();
  const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    .indexOf(weekly.day?.charAt(0).toUpperCase() + weekly.day?.slice(1).toLowerCase());

  // Generate for next 3 months (adjust as needed)
  for (let i = 0; i < 30; i++) {

    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // console.log(date.getDay(), dayIndex);
    if (date.getDay() === dayIndex) {

      // Check if this date already has a schedule (either generated or adjusted)
      const [existingSessions] = await db.promise().query(
        `SELECT COUNT(*) AS count FROM daily_schedule 
   WHERE date = ? AND section_id = ? AND start_time < ?`,
        [date, weekly.section_id, weekly.start_time]
      );
      const sessionNo = existingSessions[0].count + 1;

      // Create the daily schedule
      await db.promise().query(
        `INSERT INTO daily_schedule 
  (section_id, date, start_time, end_time, subject_id, mentors_id, activity, venue, original_schedule_id, session_no)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          weekly.section_id,
          date,
          weekly.start_time,
          weekly.end_time,
          weekly.subject_id,
          weekly.mentors_id,
          weekly.activity,
          weekly.venue,
          weeklyScheduleId,
          weekly.session_no || '0'
        ]
      );

    }
  }
}

// Helper function to regenerate future daily schedules when weekly template changes
async function regenerateFutureDailySchedules(id) {
  // Get the updated weekly schedule
  const [weekly] = await db.promise().query('SELECT * FROM weekly_schedule WHERE id = ?', [id]);
  // console.log("hi", weekly[0]);

  if (!weekly) return;

  // Delete all future non-adjusted daily schedules from this template
  await db.promise().query(
    `UPDATE daily_schedule 
     SET start_time = ?, end_time = ?, subject_id = ?, mentors_id = ?, activity = ?, venue = ?, session_no = ?
     WHERE original_schedule_id = ? AND date >= CURDATE() AND status = 'Active'`,
    [weekly[0].start_time, weekly[0].end_time, weekly[0].subject_id, weekly[0].mentors_id, weekly[0].activity, weekly[0].session_no, weekly[0].venue, id]
  );

  // Regenerate them
  // await generateDailySchedulesFromWeekly(weeklyScheduleId);
}

// Delete a schedule item
exports.deleteWeeklySchedule = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM weekly_schedule WHERE id = ?';

  const query1 = 'SELECT id FROM daily_schedule WHERE original_schedule_id = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Schedule item not found' });
    }

    db.query(query1, [id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      if (results.length > 0) {
        const dailyScheduleIds = results.map(row => row.id);
        const deleteQuery = 'DELETE FROM daily_schedule WHERE id IN (?)';
        const query2 = 'DELETE FROM acadamic_sessions WHERE dsa_id IN (?)';
        const query3 = 'DELETE FROM assessment_sessions WHERE dsa_id IN (?)';
        db.query(deleteQuery, [dailyScheduleIds], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }
          db.query(query2, [dailyScheduleIds], (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ success: false, message: 'Database error' });
            }
            if (results.affectedRows === 0) {
              return res.status(404).json({ success: false, message: 'Schedule item not found' });
            }
            db.query(query3, [dailyScheduleIds], (err, results) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Database error' });
              }
              if (results.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Schedule item not found' });
              }
              res.json({ success: true, message: 'Schedule item deleted successfully' });
            })
          })
        })
      }
    })
  });
}

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

  const { subjectId, activeSection } = req.query;

  // console.log(subjectId, activeSection);


  const sql = `
    SELECT ssa.activity_type as id, at.activity_type as activity_name
    FROM section_subject_activities ssa
    JOIN Activity_types at ON ssa.activity_type = at.id
    WHERE ssa.subject_id = ? AND ssa.section_id = ?
  `;
  db.query(sql, [subjectId, activeSection], (err, results) => {
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
    console.log(results);

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

    const [rows] = await db.promise().query(query, [gradeID]);
    const mentors = rows;
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
      // console.log(mentors);

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
// exports.assignMentorToSection = async (req, res) => {
//   const { mentor_id, grade_id } = req.body;

//   try {
//     // Step 1: Get all sections for the grade
//     const sections = await db.promise().query(
//       'SELECT id FROM Sections WHERE grade_id = ?',
//       [grade_id]
//     );

//     let assignedSectionId = null;

//     // Step 2: Check for an unassigned section
//     for (const section of sections) {
//       const mentorCheck = await db.promise().query(
//         'SELECT id FROM Mentors WHERE section_id = ?',
//         [section.id]
//       );
//       if (mentorCheck.length === 0) {
//         assignedSectionId = section.id;
//         break;
//       }
//     }

//     // Step 3: If no unassigned section found, create a new one
//     if (!assignedSectionId) {
//       const newSectionName = `Section ${String.fromCharCode(65 + sections.length)}`; // A, B, C, ...
//       const createResult = await db.promise().query(
//         'INSERT INTO Sections (section_name, grade_id) VALUES (?, ?)',
//         [newSectionName, grade_id]
//       );
//       assignedSectionId = createResult.insertId;
//     }

//     // Step 4: Assign mentor to the section
//     await db.promise().query(
//       'UPDATE Mentors SET section_id = ?, grade_id = ? WHERE id = ?',
//       [assignedSectionId, grade_id, mentor_id]
//     );

//     // Step 5: Update students in the section
//     await db.promise().query(
//       'UPDATE Students SET mentor_id = ? WHERE section_id = ?',
//       [mentor_id, assignedSectionId]
//     );

//     res.json({
//       success: true,
//       message: 'Mentor assigned to section successfully',
//       section_id: assignedSectionId
//     });

//   } catch (error) {
//     console.error('Error assigning mentor:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Database error'
//     });
//   }
// };

exports.assignMentorToSection = async (req, res) => {
  const { mentor_id, grade_id } = req.body;

  try {
    // Step 1: Get all sections for the grade
    const [sections] = await db.promise().query(
      'SELECT id FROM Sections WHERE grade_id = ?',
      [grade_id]
    );

    let assignedSectionId = null;

    // Step 2: Check for an unassigned section
    for (const section of sections) {
      const [mentorCheck] = await db.promise().query(
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
      const [createResult] = await db.promise().query(
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

// ✅ addcomplanit on  faculty 
exports.addFacultyComplaint = async (req, res) => {
  const { phone, complaint, registeredBy } = req.body;
  console.log(phone);


  if (!phone || !complaint || !registeredBy) {
    return res.status(400).json({ success: false, message: "Phone and complaint are required." });
  }

  try {
    const trx = await db.promise().beginTransaction();

    const faculty = await trx.query(
      `SELECT name FROM users WHERE phone = ?`,
      [registeredBy]
    );

    if (faculty.length === 0) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: "Registering faculty not found." });
    }

    const registeredByName = faculty[0].name;

    await trx.query(
      `INSERT INTO faculty_dicipline (phone, complaint, registered_by_phone, registered_by_name)
       VALUES (?, ?, ?, ?)`,
      [phone, complaint, registeredBy, registeredByName]
    );

    await trx.commit();
    res.status(200).json({ success: true, message: "Complaint submitted successfully." });

  } catch (error) {
    console.error("Error adding complaint:", error);
    res.status(500).json({ success: false, message: "Failed to submit complaint." });
  }
};


exports.getDisciplineLogs = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
  fd.*, 
  u.name AS faculty_name, 
  up.file_path AS profile_photo, 
  m.roll AS mentor_roll, 
  c.roll AS coordinator_roll,

  -- ID of the person who registered (mentor/coordinator/admin)
  CASE
    WHEN rm.id IS NOT NULL THEN rm.id
    WHEN rc.id IS NOT NULL THEN rc.id
    WHEN ra.id IS NOT NULL THEN ra.id
    ELSE NULL
  END AS registered_by_id,

  -- Type of the person who registered
  CASE
    WHEN rm.id IS NOT NULL THEN 'mentor'
    WHEN rc.id IS NOT NULL THEN 'coordinator'
    WHEN ra.id IS NOT NULL THEN 'admin'
    ELSE 'unknown'
  END AS registered_by_type,

  CASE
    WHEN rm.id IS NOT NULL THEN ups.file_path
    WHEN rc.id IS NOT NULL THEN ups.file_path
    WHEN ra.id IS NOT NULL THEN ups.file_path
    ELSE 'unknown'
  END AS registered_by_profile

FROM faculty_dicipline fd
JOIN users u ON fd.phone = u.phone
LEFT JOIN user_photos up ON u.phone = up.phone

-- Current faculty's own mentor/coordinator data
LEFT JOIN Mentors m ON fd.phone = m.phone
LEFT JOIN Coordinators c ON fd.phone = c.phone

-- Registered-by join based on registered_by_phone
LEFT JOIN Mentors rm ON fd.registered_by_phone = rm.phone
LEFT JOIN Coordinators rc ON fd.registered_by_phone = rc.phone
LEFT JOIN Admins ra ON fd.registered_by_phone = ra.phone

-- Registered-profile join based on registered_by_phone
LEFT JOIN User_photos ups ON fd.registered_by_phone = ups.phone

ORDER BY fd.registered_at DESC;


    `);

    res.status(200).json({ success: true, logs: rows });
  } catch (error) {
    console.error("Error fetching discipline logs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logs." });
  }
};


exports.getFacultyList = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT u.name, u.phone, m.roll as mentor_roll, c.roll as coordinator_roll, ad.roll as admin_roll
      FROM users u
      LEFT JOIN mentors m ON u.phone = m.phone
      LEFT JOIN coordinators c ON u.phone = c.phone
      LEFT JOIN Admins ad ON u.phone = ad.phone
      WHERE u.roles NOT LIKE '%Student%'
      ORDER BY u.name
    `);

    res.status(200).json({ success: true, faculty: rows });
  } catch (error) {
    console.error("Error fetching faculty list:", error);
    res.status(500).json({ success: false, message: "Failed to fetch faculty." });
  }
};

//LeaveApproval
// Get pending leave requests for mentors in a specific grade
exports.getMentorLeaveRequests = async (req, res) => {
  const { gradeId } = req.body;
  try {
    // Get all mentors for this grade who have 'Mentor' role
    const [mentors] = await db.promise().query(`
      SELECT m.id, m.phone, m.roll, u.name 
      FROM mentors m
      JOIN users u ON m.phone = u.phone
      WHERE m.grade_id = ? AND u.roles LIKE '%Mentor%'
    `, [gradeId]);

    if (mentors.length === 0) {
      return res.json({ success: true, leaveRequests: [] });
    }

    const mentorPhones = mentors.map(m => m.phone);

    // Get all pending leave requests for these mentors
    const [requests] = await db.promise().query(`
      SELECT 
        flr.id,
        flr.phone,
        flr.start_date as leaveDate,
        flr.start_date,
        flr.end_date,
        flr.leave_type as leaveType,
        flr.description as leaveReason,
        flr.status,
        flr.requested_at,
        u.name,
        m.roll as mentorRoll,
        m.id as mentor_id,
        up.file_path
      FROM facultyleaverequests flr
      JOIN users u ON flr.phone = u.phone
      JOIN mentors m ON flr.phone = m.phone
      JOIN User_photos up ON m.phone = up.phone
      WHERE flr.phone IN (?) 
        AND flr.status = 'Pending'
      ORDER BY flr.requested_at DESC
    `, [mentorPhones]);

    res.json({
      success: true,
      leaveRequests: requests.map(req => ({
        ...req,
        leaveDate: req.leaveDate.toISOString().split('T')[0], // Format date
        requested_at: req.requested_at.toISOString()
      }))
    });
  } catch (e) {
    console.error('Error fetching mentor leave requests:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
};

// Get leave history for a specific mentor
exports.getMentorLeaveHistory = async (req, res) => {
  const { phone } = req.body;
  try {
    const [history] = await db.promise().query(`
      SELECT 
        flr.*,
        u.name,
        m.roll as mentorRoll,
        up.file_path
      FROM facultyleaverequests flr
      JOIN users u ON flr.phone = u.phone
      JOIN mentors m ON flr.phone = m.phone
      JOIN User_photos up ON m.phone = up.phone
      WHERE flr.phone = ?
      ORDER BY flr.requested_at DESC
    `, [phone]);

    res.json({
      success: true,
      history: history.map(item => ({
        ...item,
        start_date: item.start_date.toISOString().split('T')[0],
        end_date: item.end_date.toISOString().split('T')[0],
        requested_at: item.requested_at.toISOString(),
        approved_at: item.approved_at ? item.approved_at.toISOString() : null,
        rejected_at: item.rejected_at ? item.rejected_at.toISOString() : null
      }))
    });
  } catch (e) {
    console.error('Error fetching mentor leave history:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch leave history' });
  }
};

// Get available mentors for substitution on a specific date
exports.getAvailableMentorsForDate = async (req, res) => {
  const { date, excludeMentorId, gradeId } = req.body;
  try {
    // Get all mentors for this grade except the one on leave
    const [mentors] = await db.promise().query(`
      SELECT 
        m.id,
        u.name,
        m.roll,
        m.phone,
        up.file_path as profilePhoto
      FROM mentors m 
      JOIN users u ON m.phone = u.phone
      LEFT JOIN user_photos up ON m.phone = up.phone
      WHERE m.id != ?
        AND u.roles LIKE '%Mentor%'
    `, [gradeId, excludeMentorId]);

    if (mentors.length === 0) {
      return res.json({ success: true, mentors: [] });
    }

    // Get all mentors who have a schedule on that date
    const [busyMentors] = await db.promise().query(`
      SELECT DISTINCT mentors_id 
      FROM daily_schedule 
      WHERE date = ?
    `, [date]);

    const busyMentorIds = busyMentors.map(m => m.mentors_id);

    // Filter out busy mentors
    const availableMentors = mentors.filter(m => !busyMentorIds.includes(m.id));

    res.json({
      success: true,
      mentors: availableMentors
    });
  } catch (e) {
    console.error('Error fetching available mentors:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch available mentors' });
  }
};

// Approve leave request and assign substitute mentor
exports.approveMentorLeave = async (req, res) => {
  const { leaveId, substituteMentorId } = req.body;

  try {
    // Start transaction
    await db.promise().query('START TRANSACTION');

    // 1. Get leave request details
    const [[leaveRequest]] = await db.promise().query(`
      SELECT 
        flr.*,
        m.id as mentor_id
      FROM facultyleaverequests flr
      JOIN mentors m ON flr.phone = m.phone
      WHERE flr.id = ?
    `, [leaveId]);

    if (!leaveRequest) {
      await db.promise().query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // 2. Get all schedules for the mentor on leave date
    const [schedules] = await db.promise().query(`
      SELECT id 
      FROM daily_schedule 
      WHERE date BETWEEN ? AND ?
        AND mentors_id = ?
    `, [leaveRequest.start_date, leaveRequest.end_date, leaveRequest.mentor_id]);

    const scheduleIds = schedules.map(s => s.id);

    if (scheduleIds.length > 0) {
      // 3. Update daily_schedule with substitute mentor
      await db.promise().query(`
        UPDATE daily_schedule 
        SET mentors_id = ? 
        WHERE id IN (?)
      `, [substituteMentorId, scheduleIds]);

      // 4. Update academic_sessions with substitute mentor
      await db.promise().query(`
        UPDATE academic_sessions 
        SET mentor_id = ? 
        WHERE dsa_id IN (?)
      `, [substituteMentorId, scheduleIds]);

      // 5. Update assessment_sessions with substitute mentor
      await db.promise().query(`
        UPDATE assessment_sessions 
        SET mentor_id = ? 
        WHERE dsa_id IN (?)
      `, [substituteMentorId, scheduleIds]);
    }

    // 6. Update leave request status to Approved
    await db.promise().query(`
      UPDATE facultyleaverequests 
      SET 
        status = 'Approved',
        approved_at = NOW(),
        substitute_mentor_id = ?
      WHERE id = ?
    `, [substituteMentorId, leaveId]);

    await db.promise().query(`
      UPDATE facultyattendance 
      SET
        leave_days = leave_days + ?,
        present_days = present_days - ?
      WHERE phone = ?
    `, [leaveRequest.total_leave_days, leaveRequest.total_leave_days, leaveRequest.phone]);

    // Commit transaction
    await db.promise().query('COMMIT');

    res.json({
      success: true,
      message: 'Leave approved and substitute assigned successfully'
    });
  } catch (e) {
    await db.promise().query('ROLLBACK');
    console.error('Error approving mentor leave:', e);
    res.status(500).json({ success: false, message: 'Failed to approve leave request' });
  }
};

// Reject leave request
exports.rejectMentorLeave = async (req, res) => {
  const { leaveId, rejectionReason } = req.body;

  try {
    await db.promise().query(`
      UPDATE facultyleaverequests 
      SET 
        status = 'Rejected',
        rejected_at = NOW(),
        rejection_reason = ?
      WHERE id = ?
    `, [rejectionReason, leaveId]);

    res.json({
      success: true,
      message: 'Leave request rejected successfully'
    });
  } catch (e) {
    console.error('Error rejecting mentor leave:', e);
    res.status(500).json({ success: false, message: 'Failed to reject leave request' });
  }
};

// Get all leave history for mentors in a grade
exports.getAllMentorLeaveHistory = async (req, res) => {
  const { gradeId } = req.body;

  try {
    // Get all mentors for this grade
    const [mentors] = await db.promise().query(`
      SELECT m.phone 
      FROM mentors m
      JOIN users u ON m.phone = u.phone
      WHERE m.grade_id = ? AND u.roles LIKE '%Mentor%'
    `, [gradeId]);

    if (mentors.length === 0) {
      return res.json({ success: true, history: [] });
    }

    const mentorPhones = mentors.map(m => m.phone);

    // Get all leave history for these mentors
    const [history] = await db.promise().query(`
      SELECT 
        flr.*,
        u.name,
        m.roll as mentorRoll,
        sub_u.name as substituteName,
        sub.roll as substituteRoll
      FROM facultyleaverequests flr
      JOIN users u ON flr.phone = u.phone
      JOIN mentors m ON flr.phone = m.phone
      LEFT JOIN mentors sub ON flr.substitute_mentor_id = sub.id
      JOIN Users sub_u ON sub.phone = sub_u.phone
      WHERE flr.phone IN (?)
      ORDER BY flr.requested_at DESC
    `, [mentorPhones]);

    res.json({
      success: true,
      history: history.map(item => ({
        ...item,
        start_date: item.start_date.toISOString().split('T')[0],
        end_date: item.end_date.toISOString().split('T')[0],
        requested_at: item.requested_at.toISOString(),
        approved_at: item.approved_at ? item.approved_at.toISOString() : null,
        rejected_at: item.rejected_at ? item.rejected_at.toISOString() : null
      }))
    });
  } catch (e) {
    console.error('Error fetching all mentor leave history:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch leave history' });
  }
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
  const { phone, event_name, location, participants_limit, event_date, grade_id, event_type, about, guidelinesRegistration, guidelinesParticipation } = req.body;
  const banner_url = req.file ? req.file.path : null;

  const sql = `
      INSERT INTO events 
      (phone, event_name, location, participants_limit, event_date, grade_id, event_type, about, registration_guidelines, participation_guidelines, banner_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    guidelinesRegistration,
    guidelinesParticipation,
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
  ANY_VALUE(g.grade_name) AS grade_name,
  COUNT(ep.id) AS participants_count
FROM events e
LEFT JOIN grades g ON e.grade_id = g.id
LEFT JOIN event_participants ep ON e.id = ep.event_id
WHERE e.grade_id = ?
GROUP BY e.id
ORDER BY e.event_date DESC;
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

//Logs
// Get overdue classes (not started after scheduled time)
exports.getOverdueClasses = async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    const query = `
      SELECT 
        ds.id,
        ds.date,
        ds.start_time,
        ds.end_time,
        s.subject_name,
        sec.section_name,
        g.grade_name,
        u.name AS mentor_name,
        m.roll AS mentor_roll,
        m.phone AS mentor_phone
      FROM daily_schedule ds
      JOIN sections sec ON ds.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN subjects s ON ds.subject_id = s.id
      JOIN mentors m ON ds.mentors_id = m.id
      JOIN users u ON m.phone = u.phone
      LEFT JOIN academic_sessions ac ON ac.dsa_id = ds.id
      WHERE sec.grade_id IN (
        SELECT grade_id FROM coordinator_grade_assignments WHERE coordinator_id = ?
      )
      AND ds.date = CURDATE()
      AND ds.start_time < CURTIME()
      AND (ac.status IS NULL OR ac.status != 'In Progress')
      ORDER BY ds.start_time
    `;

    const [results] = await db.promise().query(query, [coordinatorId]);
    res.json({ success: true, overdueClasses: results });
  } catch (error) {
    console.error("Error fetching overdue classes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch overdue classes" });
  }
};

// Get overdue student levels
exports.getOverdueStudentLevels = async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    const query = `
      SELECT 
        ol.id,
        ol.student_roll,
        st.name AS student_name,
        st.profile_photo,
        sec.section_name,
        g.grade_name,
        sub.subject_name,
        ol.level,
        ol.updated_at,
        m.roll AS mentor_roll,
        m.phone AS mentor_phone,
        u.name AS mentor_name
      FROM overdue_levels ol
      JOIN students st ON ol.student_roll = st.roll
      JOIN sections sec ON st.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      JOIN subjects sub ON ol.subject_id = sub.id
      LEFT JOIN mentors m ON st.mentor_id = m.id
      LEFT JOIN users u ON m.phone = u.phone
      WHERE sec.grade_id IN (
        SELECT grade_id FROM coordinator_grade_assignments WHERE coordinator_id = ?
      )
      AND ol.status = 'Requested'
      ORDER BY ol.updated_at DESC
    `;

    const [results] = await db.promise().query(query, [coordinatorId]);
    res.json({ success: true, overdueLevels: results });
  } catch (error) {
    console.error("Error fetching overdue levels:", error);
    res.status(500).json({ success: false, message: "Failed to fetch overdue levels" });
  }
};
exports.assignTask = async (req, res) => {
  try {
    const { overdueId } = req.body;

    const query = `
      UPDATE overdue_levels SET status = 'Assigned Task' WHERE id = ?;
    `;

    await db.promise().query(query, [overdueId]);
    res.json({ success: true, message: 'Task assigned successfully' });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ success: false, message: "Failed to assign task" });
  }
};

// Get requested assessments
exports.getRequestedAssessments = async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    const query = `
      SELECT 
  ar.id,
  ar.date,
  ar.start_time,
  ar.end_time,
  ar.status,
  g.grade_name,
  sec.section_name,
  sub.subject_name,
  ar.mentor_id,
  u.name AS mentor_name,
  m.roll AS mentor_roll,
  up.file_path,
  COUNT(asr.student_id) AS student_count,
  GROUP_CONCAT(DISTINCT asr.level ORDER BY asr.level) AS levels,
  CONCAT(
    TIME_FORMAT(ar.start_time, '%h:%i %p'), 
    ' - ', 
    TIME_FORMAT(ar.end_time, '%h:%i %p')
  ) AS time_range
FROM assessment_requests ar
JOIN grades g ON ar.grade_id = g.id
JOIN sections sec ON ar.section_id = sec.id
JOIN subjects sub ON ar.subject_id = sub.id
LEFT JOIN assessment_students asr ON ar.id = asr.assessment_id
LEFT JOIN Mentors m ON ar.mentor_id = m.id
JOIN users u ON m.phone = u.phone
LEFT JOIN user_photos up ON m.phone = up.phone
WHERE sec.grade_id IN (
        SELECT grade_id FROM coordinator_grade_assignments WHERE coordinator_id = ?
      )
        AND ar.status = 'Pending'
        GROUP BY 
  ar.id,
  ar.date,
  ar.start_time,
  ar.end_time,
  ar.status,
  ar.mentor_id,
  g.grade_name,
  sec.section_name,
  sub.subject_name,
  u.name,
  m.roll,
  up.file_path
ORDER BY ar.date DESC, ar.start_time DESC;
    `;

    const [results] = await db.promise().query(query, [coordinatorId]);
    res.json({ success: true, requestedAssessments: results });
    // console.log(results);

  } catch (error) {
    console.error("Error fetching requested assessments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch requested assessments" });
  }
};

// Process assessment request (confirm or cancel)
exports.processAssessmentRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;

    if (action === 'cancel') {
      await db.promise().query(
        `UPDATE assessment_requests SET status = 'Rejected' WHERE id = ?`,
        [requestId]
      );
      return res.json({ success: true, message: 'Assessment request cancelled' });
    }

    const [request] = await db.promise().query(
      `SELECT * FROM assessment_requests WHERE id = ?`,
      [requestId]
    );

    if (!request.length) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const assessment = request[0];

    // ✅ Get a promise-compatible connection
    const conn = await db.promise().getConnection();

    try {
      await conn.query('START TRANSACTION');

      // 0. Delete from assessment_sessions by dsa_id
      await conn.query(
        `DELETE FROM assessment_sessions 
   WHERE dsa_id IN (
     SELECT id FROM daily_schedule 
     WHERE section_id = ? 
       AND date = ? 
       AND (
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND start_time < ?) OR
         (end_time > ? AND end_time <= ?)
       )
   )`,
        [
          assessment.section_id,
          assessment.date,
          assessment.end_time, assessment.start_time,
          assessment.start_time, assessment.end_time,
          assessment.start_time, assessment.end_time
        ]
      );

      // 0b. Optionally delete from acadamic_sessions if used
      await conn.query(
        `DELETE FROM academic_sessions 
   WHERE dsa_id IN (
     SELECT id FROM daily_schedule 
     WHERE section_id = ? 
       AND date = ? 
       AND (
         (start_time < ? AND end_time > ?) OR
         (start_time >= ? AND start_time < ?) OR
         (end_time > ? AND end_time <= ?)
       )
   )`,
        [
          assessment.section_id,
          assessment.date,
          assessment.end_time, assessment.start_time,
          assessment.start_time, assessment.end_time,
          assessment.start_time, assessment.end_time
        ]
      );

      // 1. Delete existing sessions in time slot
      await conn.query(
        `DELETE FROM daily_schedule 
         WHERE section_id = ? 
         AND date = ? 
         AND (
           (start_time < ? AND end_time > ?) OR
           (start_time >= ? AND start_time < ?) OR
           (end_time > ? AND end_time <= ?)
         )`,
        [
          assessment.section_id,
          assessment.date,
          assessment.end_time, assessment.start_time,
          assessment.start_time, assessment.end_time,
          assessment.start_time, assessment.end_time
        ]
      );

      // 2. Insert into daily_schedule
      const insertResult = await conn.query(
        `INSERT INTO daily_schedule 
         (section_id, date, start_time, end_time, subject_id, mentors_id, activity)
         VALUES (?, ?, ?, ?, ?, ?, 5)`,
        [
          assessment.section_id,
          assessment.date,
          assessment.start_time,
          assessment.end_time,
          assessment.subject_id,
          assessment.mentor_id
        ]
      );

      const newScheduleId = insertResult.insertId || insertResult[0]?.insertId;

      function toLocalDateOnly(utcString) {
        const localDate = new Date(utcString); // converts to local timezone
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0'); // 0-indexed
        const day = String(localDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      // 3. Insert into assessment_sessions
      await conn.query(
        `INSERT INTO assessment_sessions 
         (dsa_id, section_id, date, subject_id, mentor_id, start_time, end_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newScheduleId,
          assessment.section_id,
          toLocalDateOnly(assessment.date),
          assessment.subject_id,
          assessment.mentor_id,
          assessment.start_time,
          assessment.end_time,
          assessment.levels
        ]
      );

      // 4. Update request status
      await conn.query(
        `UPDATE assessment_requests SET status = 'Approved' WHERE id = ?`,
        [requestId]
      );

      await conn.query('COMMIT');
      await conn.release();
      res.json({ success: true, message: 'Assessment scheduled successfully' });
    } catch (error) {
      await conn.query('ROLLBACK');
      await conn.release();
      throw error;
    }
  } catch (error) {
    console.error("Error processing assessment request:", error);
    res.status(500).json({ success: false, message: "Failed to process assessment request" });
  }
};

// New Workflow Functions

// Material Assignment for Periods
exports.assignMaterialToPeriod = async (req, res) => {
  const { dailyScheduleId, materialId, topicTitle, assignedBy } = req.body;
  
  if (!dailyScheduleId || !assignedBy) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (!materialId && !topicTitle) {
    return res.status(400).json({ success: false, message: "Either material ID or topic title is required" });
  }

  try {
    // Check if assignment already exists
    const [existing] = await db.promise().query(
      `SELECT id FROM period_material_assignments 
       WHERE daily_schedule_id = ? AND is_active = 1`,
      [dailyScheduleId]
    );

    if (existing.length > 0) {
      // Update existing assignment
      await db.promise().query(
        `UPDATE period_material_assignments 
         SET material_id = ?, topic_title = ?, assigned_by = ?, assigned_at = NOW()
         WHERE daily_schedule_id = ? AND is_active = 1`,
        [materialId, topicTitle, assignedBy, dailyScheduleId]
      );
    } else {
      // Create new assignment
      await db.promise().query(
        `INSERT INTO period_material_assignments 
         (daily_schedule_id, material_id, topic_title, assigned_by)
         VALUES (?, ?, ?, ?)`,
        [dailyScheduleId, materialId, topicTitle, assignedBy]
      );
    }

    // Update daily_schedule with material reference
    await db.promise().query(
      `UPDATE daily_schedule 
       SET assigned_material_id = ?, material_topic = ?
       WHERE id = ?`,
      [materialId, topicTitle, dailyScheduleId]
    );

    res.json({
      success: true,
      message: "Material assigned to period successfully"
    });
  } catch (err) {
    console.error("Error assigning material to period:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Get materials for assignment
exports.getMaterialsForAssignment = async (req, res) => {
  const { sectionId, subjectId, activityType } = req.body;
  
  if (!sectionId || !subjectId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Get section subject activity ID
    const [sectionSubjectActivity] = await db.promise().query(`
      SELECT ssa.id as section_subject_activity_id
      FROM section_subject_activities ssa
      JOIN activity_types at ON ssa.activity_type = at.id
      WHERE ssa.section_id = ? AND ssa.subject_id = ? 
      ${activityType ? 'AND at.activity_type = ?' : ''}
      AND ssa.is_active = 1
    `, activityType ? [sectionId, subjectId, activityType] : [sectionId, subjectId]);

    if (!sectionSubjectActivity.length) {
      return res.json({ success: true, materials: [] });
    }

    // Get materials
    const [materials] = await db.promise().query(`
      SELECT 
        id,
        file_name,
        file_url,
        COALESCE(title, topic_title, file_name) as title,
        topic_title,
        level,
        material_type,
        is_topic_based,
        can_be_continued
      FROM materials
      WHERE section_subject_activity_id IN (${sectionSubjectActivity.map(() => '?').join(',')})
      ORDER BY 
        is_topic_based DESC,
        topic_title ASC,
        level ASC,
        title ASC
    `, sectionSubjectActivity.map(s => s.section_subject_activity_id));

    // Group materials
    const groupedMaterials = {
      topic_based: materials.filter(m => m.is_topic_based),
      level_based: materials.filter(m => !m.is_topic_based)
    };

    res.json({
      success: true,
      materials: groupedMaterials,
      all_materials: materials
    });
  } catch (err) {
    console.error("Error fetching materials for assignment:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Get period assignments for a date range
exports.getPeriodMaterialAssignments = async (req, res) => {
  const { sectionId, startDate, endDate, subjectId } = req.body;
  
  if (!sectionId || !startDate) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    let query = `
      SELECT 
        pma.id as assignment_id,
        pma.daily_schedule_id,
        pma.material_id,
        pma.topic_title,
        pma.assigned_at,
        ds.date,
        ds.session_no,
        ds.start_time,
        ds.end_time,
        s.subject_name,
        m.file_name,
        m.file_url,
        COALESCE(m.title, m.topic_title, pma.topic_title) as material_title,
        m.is_topic_based,
        at.activity_type,
        sms.status as session_status
      FROM period_material_assignments pma
      JOIN daily_schedule ds ON pma.daily_schedule_id = ds.id
      JOIN subjects s ON ds.subject_id = s.id
      JOIN activity_types at ON ds.activity = at.id
      LEFT JOIN materials m ON pma.material_id = m.id
      LEFT JOIN session_material_status sms ON pma.id = sms.material_assignment_id
      WHERE ds.section_id = ? AND ds.date >= ? 
      ${endDate ? 'AND ds.date <= ?' : ''}
      ${subjectId ? 'AND ds.subject_id = ?' : ''}
      AND pma.is_active = 1
      ORDER BY ds.date, ds.session_no
    `;

    const params = [sectionId, startDate];
    if (endDate) params.push(endDate);
    if (subjectId) params.push(subjectId);

    const [assignments] = await db.promise().query(query, params);

    res.json({
      success: true,
      assignments: assignments
    });
  } catch (err) {
    console.error("Error fetching period material assignments:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Get materials available for assignment to a specific section and subject
exports.getMaterialsForAssignment = async (req, res) => {
  const { sectionId, subjectId, activityType } = req.body;
  
  if (!sectionId || !subjectId) {
    return res.status(400).json({ success: false, message: "Section ID and Subject ID required" });
  }

  try {
    // Get section details for grade information
    const [sectionInfo] = await db.promise().query(`
      SELECT sec.grade_id, g.grade_name
      FROM sections sec
      JOIN grades g ON sec.grade_id = g.id
      WHERE sec.id = ?
    `, [sectionId]);

    if (sectionInfo.length === 0) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }

    const gradeId = sectionInfo[0].grade_id;

    // Fetch topic-based materials
    const [topicMaterials] = await db.promise().query(`
      SELECT 
        m.*,
        'topic' as material_category
      FROM materials m
      WHERE m.subject_id = ? 
        AND m.grade_id = ?
        AND m.is_topic_based = 1
        AND m.is_active = 1
      ORDER BY m.topic_title, m.title
    `, [subjectId, gradeId]);

    // Fetch level-based materials (grouped by level)
    const [levelMaterials] = await db.promise().query(`
      SELECT 
        m.*,
        'level' as material_category
      FROM materials m
      WHERE m.subject_id = ? 
        AND m.grade_id = ?
        AND (m.is_topic_based = 0 OR m.is_topic_based IS NULL)
        AND m.is_active = 1
      ORDER BY m.level, m.title
    `, [subjectId, gradeId]);

    res.json({
      success: true,
      materials: {
        topic_based: topicMaterials,
        level_based: levelMaterials
      },
      grade_info: sectionInfo[0]
    });
  } catch (err) {
    console.error("Error fetching materials for assignment:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Assign material to a specific period
exports.assignMaterialToPeriod = async (req, res) => {
  const { dailyScheduleId, materialId, topicTitle, assignedBy } = req.body;
  
  if (!dailyScheduleId || !assignedBy) {
    return res.status(400).json({ 
      success: false, 
      message: "Daily schedule ID and assigned by are required" 
    });
  }

  if (!materialId && !topicTitle) {
    return res.status(400).json({ 
      success: false, 
      message: "Either material ID or topic title must be provided" 
    });
  }

  try {
    // Check if assignment already exists for this period
    const [existingAssignment] = await db.promise().query(`
      SELECT id FROM period_material_assignments 
      WHERE daily_schedule_id = ? AND is_active = 1
    `, [dailyScheduleId]);

    if (existingAssignment.length > 0) {
      // Update existing assignment
      await db.promise().query(`
        UPDATE period_material_assignments 
        SET material_id = ?, topic_title = ?, assigned_by = ?, assigned_at = CURRENT_TIMESTAMP
        WHERE daily_schedule_id = ? AND is_active = 1
      `, [materialId, topicTitle, assignedBy, dailyScheduleId]);

      res.json({
        success: true,
        message: "Material assignment updated successfully",
        assignmentId: existingAssignment[0].id
      });
    } else {
      // Create new assignment
      const [result] = await db.promise().query(`
        INSERT INTO period_material_assignments 
        (daily_schedule_id, material_id, topic_title, assigned_by)
        VALUES (?, ?, ?, ?)
      `, [dailyScheduleId, materialId, topicTitle, assignedBy]);

      res.json({
        success: true,
        message: "Material assigned successfully",
        assignmentId: result.insertId
      });
    }

    // Update daily_schedule with material assignment info
    await db.promise().query(`
      UPDATE daily_schedule 
      SET assigned_material_id = ?, material_topic = ?
      WHERE id = ?
    `, [materialId, topicTitle, dailyScheduleId]);

  } catch (err) {
    console.error("Error assigning material to period:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Get activity types with configuration options
exports.getActivityTypesWithConfig = async (req, res) => {
  const { sectionId } = req.body;
  
  try {
    const [activityTypes] = await db.promise().query(`
      SELECT 
        at.*,
        atc.current_marking_type,
        atc.updated_at as config_updated_at
      FROM activity_types at
      LEFT JOIN activity_type_configurations atc ON at.id = atc.activity_type_id 
        AND atc.section_id = ?
      WHERE at.is_active = 1
      ORDER BY at.activity_type
    `, [sectionId]);

    // Set default marking type if no configuration exists
    const typesWithDefaults = activityTypes.map(type => ({
      ...type,
      default_marking_type: type.marking_type,
      current_marking_type: type.current_marking_type || type.marking_type
    }));

    res.json({
      success: true,
      activityTypes: typesWithDefaults
    });
  } catch (err) {
    console.error("Error fetching activity types with config:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Get activity type configurations for a section
exports.getActivityTypeConfigurations = async (req, res) => {
  const { sectionId } = req.body;
  
  if (!sectionId) {
    return res.status(400).json({ success: false, message: "Section ID required" });
  }

  try {
    const [configurations] = await db.promise().query(`
      SELECT 
        atc.*,
        at.activity_type,
        at.marking_type as default_marking_type,
        s.subject_name
      FROM activity_type_configurations atc
      JOIN activity_types at ON atc.activity_type_id = at.id
      JOIN subjects s ON atc.subject_id = s.id
      WHERE atc.section_id = ?
      ORDER BY s.subject_name, at.activity_type
    `, [sectionId]);

    res.json({
      success: true,
      configurations: configurations
    });
  } catch (err) {
    console.error("Error fetching activity type configurations:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Update activity type configuration
exports.updateActivityTypeConfiguration = async (req, res) => {
  const { sectionId, subjectId, activityTypeId, markingType, updatedBy } = req.body;
  
  if (!sectionId || !subjectId || !activityTypeId || !markingType || !updatedBy) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields are required" 
    });
  }

  if (!['attentiveness', 'marks'].includes(markingType)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid marking type" 
    });
  }

  try {
    // Check if configuration already exists
    const [existingConfig] = await db.promise().query(`
      SELECT id FROM activity_type_configurations 
      WHERE section_id = ? AND subject_id = ? AND activity_type_id = ?
    `, [sectionId, subjectId, activityTypeId]);

    if (existingConfig.length > 0) {
      // Update existing configuration
      await db.promise().query(`
        UPDATE activity_type_configurations 
        SET current_marking_type = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE section_id = ? AND subject_id = ? AND activity_type_id = ?
      `, [markingType, updatedBy, sectionId, subjectId, activityTypeId]);
    } else {
      // Create new configuration
      await db.promise().query(`
        INSERT INTO activity_type_configurations 
        (section_id, subject_id, activity_type_id, current_marking_type, updated_by)
        VALUES (?, ?, ?, ?, ?)
      `, [sectionId, subjectId, activityTypeId, markingType, updatedBy]);
    }

    res.json({
      success: true,
      message: "Activity type configuration updated successfully"
    });
  } catch (err) {
    console.error("Error updating activity type configuration:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Get section subjects for coordinator management
exports.getSectionSubjects = async (req, res) => {
  const { sectionId } = req.body;
  
  if (!sectionId) {
    return res.status(400).json({ success: false, message: "Section ID required" });
  }

  try {
    const [subjects] = await db.promise().query(`
      SELECT DISTINCT
        s.id,
        s.subject_name,
        sec.section_name,
        g.grade_name,
        g.id as grade_id
      FROM section_subject_activities ssa
      JOIN subjects s ON ssa.subject_id = s.id
      JOIN sections sec ON ssa.section_id = sec.id
      JOIN grades g ON sec.grade_id = g.id
      WHERE ssa.section_id = ? AND ssa.is_active = 1
      ORDER BY s.subject_name
    `, [sectionId]);

    res.json({
      success: true,
      subjects: subjects
    });
  } catch (err) {
    console.error("Error fetching section subjects:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Upload material by coordinator
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, subjectId, gradeId, level, isTopicBased, topicTitle, canBeContinued, uploadedBy } = req.body;
    
    if (!title || !subjectId || !gradeId || !uploadedBy) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, subject ID, grade ID, and uploaded by are required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const fileName = req.file.filename;
    const fileUrl = `/uploads/materials/${fileName}`;
    const materialType = req.file.mimetype.split('/')[1].toUpperCase();

    const query = `
      INSERT INTO materials 
      (title, subject_id, grade_id, level, file_name, file_url, material_type, 
       is_topic_based, topic_title, can_be_continued, upload_date, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)
    `;

    const [result] = await db.promise().query(query, [
      title, 
      subjectId, 
      gradeId, 
      level || 1, 
      fileName, 
      fileUrl, 
      materialType,
      isTopicBased === '1' ? 1 : 0,
      topicTitle || null,
      canBeContinued === '1' ? 1 : 0
    ]);

    res.json({ 
      success: true, 
      message: 'Material uploaded successfully',
      materialId: result.insertId,
      fileName: fileName,
      fileUrl: fileUrl
    });
  } catch (error) {
    console.error('Error in uploadMaterial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Get materials for a section
exports.getMaterialsForSection = async (req, res) => {
  const { sectionId, gradeId } = req.body;
  
  if (!sectionId || !gradeId) {
    return res.status(400).json({ 
      success: false, 
      message: "Section ID and Grade ID are required" 
    });
  }

  try {
    const [materials] = await db.promise().query(`
      SELECT 
        m.*,
        s.subject_name
      FROM materials m
      JOIN subjects s ON m.subject_id = s.id
      JOIN section_subject_activities ssa ON s.id = ssa.subject_id AND ssa.section_id = ?
      WHERE m.grade_id = ? AND m.is_active = 1
      ORDER BY s.subject_name, m.is_topic_based DESC, m.level, m.title
    `, [sectionId, gradeId]);

    res.json({
      success: true,
      materials: materials
    });
  } catch (err) {
    console.error("Error fetching materials for section:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.body;
    
    if (!materialId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Material ID is required' 
      });
    }

    // Soft delete the material
    const [result] = await db.promise().query(`
      UPDATE materials SET is_active = 0 WHERE id = ?
    `, [materialId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Material deleted successfully' 
    });
  } catch (error) {
    console.error('Error in deleteMaterial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};



