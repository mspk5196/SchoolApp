const db = require('../config/db');

exports.getCoordinatorData = (req, res) => {
  const { phoneNumber } = req.body;
  const sql = `
    SELECT c.id AS id, c.name, c.roll, c.phone, c.section_id, c.grade_id,
           sec.section_name, g.grade_name, sub.subject_name
    FROM Coordinators c
    LEFT JOIN Sections sec ON c.section_id = sec.id
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
    SELECT m.id AS mentor_id, m.name AS mentor_name, m.roll AS mentor_roll,
           sec.id AS section_id, sec.section_name, sub.subject_name
    FROM Mentors m
    JOIN Sections sec ON m.section_id = sec.id
    JOIN Subjects sub ON m.subject_id = sub.id
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
    SELECT g.grade_name, s.section_name, st.roll, st.name AS student_name, m.name AS mentor_name
    FROM Students st
    JOIN Sections s ON st.section_id = s.id
    JOIN Grades g ON s.grade_id = g.id
    LEFT JOIN Mentors m ON st.section_id = m.section_id
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