const db = require('../../config/db');

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