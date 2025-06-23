const express = require('express');
const router = express.Router();
const { login, uploadPrivateKey, getPrivateKey } = require('../controllers/auth/authController');

router.post('/login', login);
router.post('/keys/private/upload', uploadPrivateKey);
// Corrected from POST to GET
router.get('/keys/private/get', getPrivateKey);

module.exports = router;