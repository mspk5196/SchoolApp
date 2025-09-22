const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;

const publicPaths = [
    '/api/login',
    '/api/auth/google-login',
    '/health',
    '/cron-status'
    // add any other public routes here
];

function authMiddleware(req, res, next) {
    if (!SECRET_KEY) {
        console.error('⚠️ JWT_SECRET is not set! Exiting...');
        process.exit(1);
    }
    // Skip public routes
    if (publicPaths.includes(req.path)) return next();

    const authHeader = req.headers.authorization;
    // console.log(`Auth Header: ${authHeader}`);
    if (!authHeader) return res.status(401).json({ message: 'Token required' });

    const token = authHeader.split(' ')[1]; // Expect: Bearer <token>
    // console.log(`Token: ${token}`);
    // console.log(`Verifying token with secret: ${SECRET_KEY}`);

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // console.log('JWT decoded:', decoded);
        req.user = decoded; // attach decoded token
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

module.exports = authMiddleware;
