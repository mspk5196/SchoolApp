const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');
const { authenticateToken } = require('../middleware/auth');


module.exports = router;