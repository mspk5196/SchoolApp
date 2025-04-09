const db = require('../config/db');

exports.login = (req, res) => {
  const { phoneNumber, password } = req.body;

  const query = 'SELECT * FROM Users WHERE phone = ?';
  db.query(query, [phoneNumber], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'Invalid phone number or password' });

    const user = results[0];
    if (user.password_hash !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const roles = user.roles.split(',').map(role => role.trim());
    res.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, roles } });
  });
};
