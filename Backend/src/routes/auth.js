const express = require('express');
const router = express.Router();
const { login } = require('../controllers/auth/authController');

router.post('/login', login);

// SECURITY NOTE: Removed private key upload/retrieval routes for security.
// Private keys should NEVER be stored on or retrieved from the server.
// They must remain local to user devices to maintain end-to-end encryption.

module.exports = router;