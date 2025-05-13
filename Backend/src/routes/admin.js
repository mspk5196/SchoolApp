const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const coordinatorEnrolment = require('../controllers/admin/coordinatorEnrolment');
const multer = require('multer');

const profileCoordinatorPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profileImages/coordinator');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const uploadCoordinatorProfile = multer({ storage: profileCoordinatorPhotoStorage });

router.post('/admin/getAdminData', adminController.getAdminData);

// Student home routes
router.get('/admin/grades', adminController.getGrades);
router.get('/admin/stats/:gradeId', adminController.getStudentStatsByGrade);

// Student list routes
router.get('/admin/grades/:gradeId/sections', adminController.getGradeSections);
router.get('/admin/section/:sectionId/students', adminController.getStudentsByGradeAndSection);

// Student details routes
router.get('/admin/students/:studentId', adminController.getStudentDetails);
router.post('/admin/students/getSubjectMentors', adminController.getSubjectMentors);
router.get('/admin/students/:roll/attendance', adminController.getAttendance);
router.get('/admin/students/getStudentIssueLogs/:roll', adminController.getStudentIssueLogs);

// Issue log routes
router.get('/admin/sections/:sectionId/discipline-issues', adminController.getStudentDisciplineLogs);
router.get('/admin/issues/search/:gradeId', adminController.searchDisciplineIssues);

// Backlogs routes
router.get('/admin/backlogs/:gradeId/:section', adminController.getStudentBacklogs);
router.get('/admin/backlogs/search/:gradeId', adminController.searchStudentBacklogs);

// Coordinator Enrolment
router.post(
  '/admin/enrollCoordinator',
  uploadCoordinatorProfile.single('profilePhoto'),
  coordinatorEnrolment.enrollCoordinator
);

module.exports = router;