const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');
const { authenticateToken } = require('../middleware/auth');
const getAcademicYear = require('../middleware/getAcademicYear');

router.use(authenticateToken);
router.use(getAcademicYear);

module.exports = router;