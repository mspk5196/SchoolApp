const db = require('../../config/db');

exports.mentorStudents = (req, res) => {
  const { mentorId } = req.body;
  const query = `
    SELECT s.id, s.name, s.roll, sec.section_name, sub.subject_name
    FROM Students s
    INNER JOIN Mentors m ON s.section_id = m.section_id
    INNER JOIN Sections sec ON s.section_id = sec.id
    INNER JOIN Subjects sub ON m.subject_id = sub.id
    WHERE m.id = ?;
  `;
  db.query(query, [mentorId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, mentorStudents: results });
  });
};

exports.getMentorData = (req, res) => {
  const { phoneNumber } = req.body;
  const query = `
    SELECT m.id, u.name, m.roll, m.grade_id, sec.section_name, sub.subject_name
    FROM Mentors m
    JOIN Users u ON m.phone = u.phone
    JOIN Sections sec ON m.section_id = sec.id
    LEFT JOIN mentor_section_assignments msa ON m.id = msa.mentor_id
    LEFT JOIN Subjects sub ON msa.subject_id = sub.id
    WHERE m.phone = ?;
  `;
  db.query(query, [phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, mentorData: results });
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

//Materials
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

exports.getMaterials = async (req, res) => {
  const { gradeID, subjectID } = req.query;
  console.log(`[GET] /api/mentor/getMaterials?gradeID=${gradeID}&subjectID=${subjectID}`);

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