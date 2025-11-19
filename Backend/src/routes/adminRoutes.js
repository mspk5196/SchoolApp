const express = require('express');
const router = express.Router();
const multer = require('multer');
const facultyEnrollement = require('../controllers/admin/facultyEnrollement');
const { authenticateToken } = require('../middleware/auth');
const getAcademicYear = require('../middleware/getAcademicYear');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.use(authenticateToken);
router.use(getAcademicYear);

// Faculty enrollment routes
router.post('/enrollfaculty', facultyEnrollement.enrollFaculty);
router.get('/enrollment/generate-faculty-enroll-template', facultyEnrollement.generateFacultyEnrollTemplate);
router.post('/enrollment/bulk-upload-facultys', upload.single('file'), facultyEnrollement.bulkUploadFaculty);

module.exports = router;
