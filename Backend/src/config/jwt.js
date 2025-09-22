const jwt = require('jsonwebtoken');

// Secret key for signing tokens - store in environment variables for production
const JWT_SECRET = process.env.JWT_SECRET;

// Generate a token for a user
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Verify a token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };