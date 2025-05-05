const db = require('../../config/db');

exports.getAdminData = (req, res) => {
  const { phoneNumber } = req.body;
  const sql = `
    SELECT a.id AS id, a.roll, a.phone, u.name
    FROM Admins a
    JOIN Users u ON a.phone = u.phone
    WHERE a.phone = ?;
  `;
  db.query(sql, [phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false });
    if (results.length === 0) return res.status(404).json({ success: false });
    res.json({ success: true, adminData: results[0] });
  });
};

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