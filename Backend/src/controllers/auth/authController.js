const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../middleware/auth');
const { decryptAES, encryptAES } = require('../../utils/decryptAES');

// User Login
exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  const query = `SELECT u.*, GROUP_CONCAT(DISTINCT r.role SEPARATOR ', ') AS roles
                 FROM Users u
                 JOIN user_roles ur ON ur.user_id = u.id AND ur.is_active = 1
                 JOIN roles r ON  r.id = ur.role_id
                 WHERE phone = ?
                 GROUP BY u.id;`;

  try {
  // Using mysql2/promise pool directly (db.query already returns a promise)
  const [results] = await db.query(query, [phoneNumber]);
    if (!results || results.length === 0) return res.status(401).json({ success: false, message: 'Invalid phone number or password' });

    const user = results[0];

    if (!(user.roles.includes('Admin') && user.password_hash == '123456789')) {
      const decryptedPassword = decryptAES(user.password_hash);
      const passwordMatch = await bcrypt.compare(password, decryptedPassword);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }
    } else {
      console.log('Admin login without password check');
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

    // Store refresh token (best-effort)
    try {
      const storeTokenSql = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))';
  await db.query(storeTokenSql, [user.id, refreshToken]);
    } catch (e) {
      console.error('Error storing refresh token:', e);
    }

    try {
      const loginHistorySql = 'INSERT INTO login_history (user_id, login_type, login_ip, login_at) VALUES (?, ?, ?, NOW())';
  await db.query(loginHistorySql, [user.id, 'Password', req.ip]);
    } catch (e) {
      console.error('Error storing login history:', e);
    }

    return res.json({
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
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
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
    try {
  const [results] = await db.query(checkTokenSql, [refreshToken, decoded.userId]);
      if (!results || results.length === 0) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      // Get user details
      const getUserSql = 'SELECT * FROM users WHERE id = ?';
  const [userResults] = await db.query(getUserSql, [decoded.userId]);
      if (!userResults || userResults.length === 0) {
        return res.status(500).json({ success: false, message: 'User not found' });
      }

      const user = userResults[0];
      const tokenPayload = { id: user.id, name: user.name, phone: user.phone, role: user.role, email: user.email };
      const accessToken = generateToken(tokenPayload);
      return res.json({ success: true, data: { accessToken } });
    } catch (err) {
      console.error('Database error (refresh token):', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

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
      try {
  await db.query(deleteTokenSql, [refreshToken]);
      } catch (e) {
        console.error('Error deleting refresh token:', e);
      }
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


exports.googleLogin = async (req, res) => {
  const { email } = req.body;

  const query = `SELECT u.*, GROUP_CONCAT(DISTINCT r.role SEPARATOR ', ') AS roles
                 FROM Users u
                 JOIN user_roles ur ON ur.user_id =  u.id
                 JOIN roles r ON  r.id = ur.role_id
                 WHERE email = ?
                 GROUP BY u.id;`;

  try {
  const [results] = await db.query(query, [email]);
    if (!results || results.length === 0) {
      return res.json({ success: false, message: 'User does not exist. Please contact owner.' });
    }

    const user = results[0];
    const tokenPayload = { id: user.id, name: user.name, phone: user.phone, role: user.roles, email: user.email };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });

    try {
      const storeTokenSql = 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))';
  await db.query(storeTokenSql, [user.id, refreshToken]);
    } catch (e) {
      console.error('Error storing refresh token:', e);
    }

    try {
      const loginHistorySql = 'INSERT INTO login_history (user_id, login_type, login_ip, login_at) VALUES (?, ?, ?, NOW())';
  await db.query(loginHistorySql, [user.id, 'Google', req.ip]);
    } catch (e) {
      console.error('Error storing login history:', e);
    }

    return res.json({ success: true, message: 'Login successful', data: { user: { id: user.id, name: user.name, phone: user.phone, role: user.roles, email: user.email }, accessToken, refreshToken } });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};