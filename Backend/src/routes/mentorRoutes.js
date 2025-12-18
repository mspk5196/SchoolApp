const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');
const { authenticateToken } = require('../middleware/auth');
const getAcademicYear = require('../middleware/getAcademicYear');

router.use(authenticateToken);
router.use(getAcademicYear);

// Schedule routes
router.post('/getMentorSchedule', mentorController.getMentorSchedule);
router.post('/getSessionDetails', mentorController.getSessionDetails);

// Session management routes
router.post('/startSession', mentorController.startSession);
router.post('/getStudentsForSession', mentorController.getStudentsForSession);
router.post('/endSession', mentorController.endSession);

module.exports = router;