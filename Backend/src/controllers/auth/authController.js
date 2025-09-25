const db = require('../../config/db');
const bcrypt = require('bcrypt');
const { decryptAES } = require('../../utils/decryptAES');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

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
      // ✅ Create JWT
      const token = jwt.sign(
        { id: user.id, phone: user.phone, roles }, // payload
        SECRET_KEY,
        { expiresIn: '1h' } // token expires in 1 hour
      );

      // ✅ Send token + user info to frontend
      res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, phone: user.phone, roles }
      });
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
      // ✅ Issue JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, roles },
        SECRET_KEY,
        { expiresIn: '1h' }
      );
      // console.log('Google login successful for user:', user);
      
      return res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, phone: user.phone, email: user.email, roles }
      });
    }
  });
};