const express = require('express');
const router = express.Router();
const multer = require('multer');
const enrollmentController = require('../controllers/coordinator/enrollmentController');
const coordinatorController = require('../controllers/coordinator/coordinatorController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Section management routes
router.post('/enrollment/getSectionsByGrade', authenticateToken, enrollmentController.getSectionsByGrade);
router.post('/enrollment/createSection', authenticateToken, enrollmentController.createSection);
router.post('/enrollment/deleteSection', authenticateToken, enrollmentController.deleteSection);

// Student enrollment routes
router.post('/enrollment/enrollStudent', authenticateToken, enrollmentController.enrollStudent);
router.get('/enrollment/generate-student-enroll-template', authenticateToken, enrollmentController.generateStudentEnrollTemplate);
router.post('/enrollment/bulk-upload-students', authenticateToken, upload.single('file'), enrollmentController.bulkUploadStudents);

// Mentor assignment routes
router.post('/getSectionsWithMentors', authenticateToken, coordinatorController.getSectionsWithMentors);
router.get('/getUnassignedMentors', authenticateToken, coordinatorController.getUnassignedMentors);
router.post('/assignMentorToSection', authenticateToken, coordinatorController.assignMentorToSection);
router.post('/unassignMentorFromSection', authenticateToken, coordinatorController.unassignMentorFromSection);
router.post('/getStudentsBySection', authenticateToken, coordinatorController.getStudentsBySection);

module.exports = router;

