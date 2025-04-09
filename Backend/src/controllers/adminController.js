const db = require('../config/db');

exports.adminCoordinators = (req, res) => {
  const query = `
    SELECT c.id, c.name, g.grade_name
    FROM Coordinators c
    INNER JOIN Grades g ON c.grade_id = g.id;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, adminCoordinators: results });
  });
};