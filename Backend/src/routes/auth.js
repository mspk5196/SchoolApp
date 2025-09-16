const express = require('express');
const router = express.Router();
const { login, googleLogin } = require('../controllers/auth/authController');

router.post('/login', login);
router.post('/google-login', googleLogin);

// SECURITY NOTE: Removed private key upload/retrieval routes for security.
// Private keys should NEVER be stored on or retrieved from the server.
// They must remain local to user devices to maintain end-to-end encryption.

module.exports = router;