const express = require('express');
const router = express.Router();
const multer = require('multer');
const enrollmentController = require('../controllers/coordinator/enrollmentController');
const { authenticateToken } = require('../middleware/auth');

// Section management routes
router.post('/enrollment/getSectionsByGrade', authenticateToken, enrollmentController.getSectionsByGrade);
router.post('/enrollment/createSection', authenticateToken, enrollmentController.createSection);
router.post('/enrollment/deleteSection', authenticateToken, enrollmentController.deleteSection);

module.exports = router;
