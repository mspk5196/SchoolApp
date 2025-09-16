const db = require('../../config/db');
const bcrypt = require('bcrypt');
const { decryptAES } = require('../../utils/decryptAES');
const { verifyFirebaseToken } = require('../../config/firebase');

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

exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the Firebase ID token
    const decodedToken = await verifyFirebaseToken(idToken);
    const { email, name, uid } = decodedToken;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not found in token' });
    }

    // Check if user exists in database
    const query = 'SELECT * FROM Users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (results.length === 0) {
        // User doesn't exist, you might want to create them or return an error
        return res.status(401).json({ 
          success: false, 
          message: 'User not found. Please contact administrator to register your account.' 
        });
      }

      const user = results[0];
      const roles = user.roles.split(',').map(role => role.trim());
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          name: user.name || name, 
          email: user.email,
          phone: user.phone, 
          roles 
        } 
      });
    });

  } catch (error) {
    console.error('Google login error:', error);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};