const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student/studentController');

router.post('/getStudentData', studentController.getStudentData);
router.post('/studentDetails', studentController.getStudentDetails);
router.post('/studentLeaveApply', studentController.applyStudentLeave);
router.post('/getStudentLeaves', studentController.getStudentLeaves);
router.post('/cancelStudentLeave', studentController.cancelStudentLeave);
router.post('/createStudentRequest', studentController.createStudentRequest);
router.get('/fetchDocumentTypes', studentController.fetchDocumentTypes);
router.post('/fetchStudentRequests', studentController.fetchStudentRequests);
router.post('/fetchStudentDocument', studentController.fetchStudentDocument);
router.get('/fetchDocumentPurpose', studentController.fetchDocumentPurpose);

module.exports = router;