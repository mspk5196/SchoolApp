const db = require('../config/db');

exports.getStudentData = (req, res) => {
  const { phoneNumber } = req.body;
  const sql = `
    SELECT s.id AS student_id, s.name, s.roll, s.aadhar_no, s.emis_no, s.blood_grp,
           s.father_name, s.mother_name, s.father_mob, s.mother_mob, s.address,
           s.pincode, sec.section_name, g.grade_name
    FROM Students s
    JOIN Sections sec ON s.section_id = sec.id
    JOIN Grades g ON sec.grade_id = g.id
    WHERE s.father_mob = ? OR s.mother_mob = ?;
  `;
  db.query(sql, [phoneNumber, phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, student: results[0] });
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