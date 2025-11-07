const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../middleware/auth');
const { decryptAES, encryptAES } = require('../../utils/decryptAES');

// User Login
exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  // console.log(phoneNumber);

  const query = `SELECT u.*, GROUP_CONCAT(DISTINCT r.role SEPARATOR ', ') AS roles
                 FROM Users u
                 JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = 1
                 JOIN roles r ON  r.id = ur.role_id
                 WHERE phone = ?
                 GROUP BY u.id;`;

  db.query(query, [phoneNumber], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ success: false, message: 'Invalid phone number or password' });

    const user = results[0];

    try {
      if (user.roles.includes('Admin') && user.password_hash == '123456789') {
        console.log('Admin login without password check');
      } else {
        const decryptedPassword = decryptAES(user.password_hash);
        const passwordMatch = await bcrypt.compare(password, decryptedPassword);

        if (!passwordMatch) {
          return res.status(401).json({ success: false, message: 'Incorrect password' });
        }
      }

      const tokenPayload = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.roles,
        email: user.email
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Store refresh token
      const storeTokenSql = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))';
      db.query(storeTokenSql, [user.id, refreshToken], (err) => {
        if (err) {
          console.error('Error storing refresh token:', err);
        }
      });

       const loginHistorySql = 'INSERT INTO login_history (user_id, login_type, login_ip, login_at) VALUES (?, ?, ?, NOW())';
      db.query(loginHistorySql, [user.id, 'Password', req.ip], (err) => {
        if (err) {
          console.error('Error storing login history:', err);
        }
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.roles,
            email: user.email
          },
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });
    } catch (error) {
      console.error('Decryption or comparison error:', error);
      return res.status(500).json({ success: false, message: 'Decryption error' });
    }
  });
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in database
    const checkTokenSql = 'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()';
    db.query(checkTokenSql, [refreshToken, decoded.userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Server error'
        });
      }

      if (results.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      // Get user details
      const getUserSql = 'SELECT * FROM users WHERE id = ?';
      db.query(getUserSql, [decoded.userId], (err, userResults) => {
        if (err || userResults.length === 0) {
          return res.status(500).json({
            success: false,
            message: 'User not found'
          });
        }

        const user = userResults[0];

        const tokenPayload = {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          email: user.email
        };

        const accessToken = generateToken(tokenPayload);

        res.json({
          success: true,
          data: {
            accessToken: accessToken
          }
        });
      });
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove refresh token from database
      const deleteTokenSql = 'DELETE FROM refresh_tokens WHERE token = ?';
      db.query(deleteTokenSql, [refreshToken], (err) => {
        if (err) {
          console.error('Error deleting refresh token:', err);
        }
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.googleLogin = (req, res) => {

  const { email } = req.body;

  const query = `SELECT u.*, GROUP_CONCAT(DISTINCT r.role SEPARATOR ', ') AS roles
                 FROM Users u
                 JOIN user_roles ur ON ur.user_id =  u.id
                 JOIN roles r ON  r.id = ur.role_id
                 WHERE email = ?
                 GROUP BY u.id;`;

  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    // console.log(results);
    
    if (results.length === 0) {
      res.json({ success: false, message: 'User does not exist. Please contact owner.' });
    } else {
      const user = results[0];
      // console.log(user);
      
      const tokenPayload = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.roles,
        email: user.email
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken({ userId: user.id });

      // Store refresh token
      const storeTokenSql = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))';
      db.query(storeTokenSql, [user.id, refreshToken], (err) => {
        if (err) {
          console.error('Error storing refresh token:', err);
        }
      });

      const loginHistorySql = 'INSERT INTO login_history (user_id, login_type, login_ip, login_at) VALUES (?, ?, ?, NOW())';
      db.query(loginHistorySql, [user.id, 'Google', req.ip], (err) => {
        if (err) {
          console.error('Error storing login history:', err);
        }
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.roles,
            email: user.email
          },
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });
    }
  });
};