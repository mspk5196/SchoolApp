const db = require('../../config/db');

exports.getStudentData = (req, res) => {
  const { phoneNumber } = req.body;
  const sql = `
    SELECT s.id AS student_id, s.name, s.roll, s.section_id, s.aadhar_no, s.emis_no, s.blood_grp,
           s.father_name, s.mother_name, s.father_mob, s.mother_mob, s.address,
           s.pincode, sec.section_name, g.grade_name,sec.grade_id, sa.leave_days
    FROM Students s
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    LEFT JOIN StudentAttendance sa ON s.roll = sa.roll
    WHERE s.father_mob = ? OR s.mother_mob = ?;
  `;
  db.query(sql, [phoneNumber, phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, student: results });
  });
};

exports.getStudentDetails = (req, res) => {
  const { studentId } = req.body;
  const query = `
    SELECT s.name AS student_name, m.name AS mentor_name, c.name AS coordinator_name 
    FROM Students s
    LEFT JOIN Mentors m ON s.section_id = m.section_id
    LEFT JOIN Coordinators c ON s.section_id = c.section_id
    WHERE s.id = ?;
  `;
  db.query(query, [studentId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, data: result[0] });
  });
};

// Apply for student leave
exports.applyStudentLeave = (req, res) => {
  const {
    roll, name, sectionId, totalLeaveDays,
    leaveType, fromDate, toDate, fromTime, toTime, reason
  } = req.body;

  if (!roll || !name || !sectionId || !leaveType || !fromDate || !toDate || !reason) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const values = [roll, name, sectionId, totalLeaveDays, leaveType, fromDate, toDate, fromTime, toTime, reason];

  const insertLeaveSql = `
    INSERT INTO StudentLeaveRequests (
      student_roll, student_name, section_id, no_of_days,
      leave_type, start_date, end_date, start_time, end_time, reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertLeaveSql, values, (err, result) => {
    if (err) {
      console.error('Error applying leave for student:', roll, err);
      return res.status(500).json({ success: false, message: 'Database error while submitting leave request' });
    }

    res.json({
      success: true,
      message: 'Leave request submitted successfully',
      leaveId: result.insertId
    });

  });
};

exports.getStudentLeaves = (req, res) => {

  const { roll } = req.body;

  const sql = `
    SELECT 
      * FROM StudentLeaveRequests sl
    WHERE sl.student_roll = ?
    ORDER BY sl.id DESC
  `;

  db.query(sql, [roll], (err, results) => {
    if (err) {
      console.error('Error fetching leave details:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, leaves: results });
  });
};

exports.cancelStudentLeave = (req, res) => {
  const { leaveId } = req.body;

  if (!leaveId) {
    return res.status(400).json({ success: false, message: 'Leave ID is required' });
  }

  const sql = `UPDATE StudentLeaveRequests SET status = 'Cancelled' WHERE id = ?`;

  db.query(sql, [leaveId], (err, result) => {
    if (err) {
      console.error('Error cancelling leave:', err);
      return res.status(500).json({ success: false, message: 'Database error while cancelling leave' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Leave not found' });
    }

    res.json({ success: true, message: 'Leave cancelled successfully' });
  });
};

exports.createStudentRequest = (req, res) => {
  const { roll, grade, requestID, docTypes, purpose, status } = req.body;

  if (!roll || !docTypes || !purpose) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const sql = `
      INSERT INTO Document_Requests (student_roll, grade_id, requestID, document_type, purpose, status)
      VALUES (?, ?, ?, ?, ?, ?)`;

  const typesJson = JSON.stringify(docTypes);
  const purposeJson = JSON.stringify(purpose);

  db.query(sql, [roll, grade, requestID, typesJson, purposeJson, status], (err, result) => {
    if (err) {
      console.error("Error creating student request:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Request submitted successfully", requestId: result.insertId });
  });
};

exports.fetchStudentRequests = (req, res) => {
  const { roll } = req.body;

  const sql = `
      SELECT * FROM Document_Requests WHERE student_roll = ?`;

  db.query(sql, [roll], (err, result) => {
    if (err) {
      console.error("Error fetching student request:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Student Request fetched successfully", studentRequests: result });
  });
};

exports.fetchStudentDocument = (req, res) => {

  const { request_id } = req.body;

  const sql = `
      SELECT * FROM Student_Document WHERE request_id = ?`;

  db.query(sql, [request_id], (err, result) => {
    if (err) {
      console.error("Error fetching student document:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({ success: true, message: "Student Requested document fetched successfully", studentDocument: result });
  });
};

exports.fetchDocumentTypes = (req, res) => {

  const sql = `
      SELECT * FROM Document_Types;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching document types:", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

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
