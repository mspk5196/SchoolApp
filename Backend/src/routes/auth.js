const express = require('express');
const router = express.Router();
const { login, googleLogin } = require('../controllers/auth/authController');

router.post('/login', login);
router.post('/auth/google-login', googleLogin);

module.exports = router;