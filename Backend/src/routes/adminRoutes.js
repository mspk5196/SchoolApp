const express = require('express');
const router = express.Router();
const multer = require('multer');
const facultyEnrollement = require('../controllers/admin/facultyEnrollement');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Faculty enrollment routes
router.post('/enrollfaculty', authenticateToken, facultyEnrollement.enrollFaculty);
router.get('/enrollment/generate-faculty-enroll-template', authenticateToken, facultyEnrollement.generateFacultyEnrollTemplate);
router.post('/enrollment/bulk-upload-facultys', authenticateToken, upload.single('file'), facultyEnrollement.bulkUploadFaculty);

module.exports = router;
