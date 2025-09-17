const db = require('../../config/db');
const bcrypt = require('bcrypt');
const { decryptAES } = require('../../utils/decryptAES');

exports.login = (req, res) => {
  const { phoneNumber, password } = req.body;

  const query = 'SELECT * FROM Users WHERE phone = ?';
  db.query(query, [phoneNumber], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'Invalid phone number or password' });

    const user = results[0];

    try { 
      const decryptedPassword = decryptAES(password); // decrypt AES password
      const passwordMatch = await bcrypt.compare(decryptedPassword, user.password_hash); // compare with stored hash
      // bcrypt.hash('135', 12).then(console.log);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }

      const roles = user.roles.split(',').map(role => role.trim());
      res.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, roles } });

    } catch (error) {
      console.error('Decryption or comparison error:', error);
      return res.status(500).json({ success: false, message: 'Decryption error' });
    }
  });
};

exports.googleLogin = (req, res) => {
  const { email } = req.body;
  console.log('Google login attempt for email:', email);
  

  const query = 'SELECT id, name, email, phone, roles FROM Users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });

    if (results.length === 0) {
      res.json({ success: false, message: 'User does not exist. Please contact owner.' });
    } else {
      // User exists
      const user = results[0];
      const roles = user.roles.split(',').map(role => role.trim());
      console.log('User found:', user);
      return res.json({ success: true, user: { id: user.id, name: user.name, phone: user.phone, email: user.email, roles } });
    }
  });
};