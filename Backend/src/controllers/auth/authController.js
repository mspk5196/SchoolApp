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

exports.uploadPrivateKey = (req, res) => {
    const { user_id, user_type, encrypted_private_key } = req.body;
    if (!user_id || !user_type || !encrypted_private_key) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }
    const sql = `
        INSERT INTO user_private_keys (user_id, user_type, encrypted_private_key)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE encrypted_private_key = VALUES(encrypted_private_key)
    `;
    db.query(sql, [user_id, user_type, encrypted_private_key], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error' });
        res.json({ success: true });
    });
};

exports.getPrivateKey = async (req, res) => {
    const { user_id, user_type } = req.query;
    if (!user_id || !user_type) return res.status(400).json({ success: false });
    db.query(
        'SELECT encrypted_private_key FROM user_private_keys WHERE user_id=? AND user_type=?',
        [user_id, user_type],
        (err, results) => {
            if (err || results.length === 0) return res.status(404).json({ success: false });
            res.json({ encrypted_private_key: results[0].encrypted_private_key });
        }
    );
};