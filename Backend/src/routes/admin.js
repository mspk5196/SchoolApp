const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');

router.post('/admin/getAdminData', adminController.getAdminData);

// Student home routes
router.get('/admin/grades', adminController.getGrades);
router.get('/admin/stats/:gradeId', adminController.getStudentStatsByGrade);

// Student list routes
router.get('/admin/grades/:gradeId/sections', adminController.getGradeSections);
router.get('/admin/section/:sectionId/students', adminController.getStudentsByGradeAndSection);
// router.get('/admin/students/search/:gradeId', adminController.searchStudents);

// Student details routes
router.get('/admin/students/:studentId', adminController.getStudentDetails);
router.post('/admin/students/getSubjectMentors', adminController.getSubjectMentors);
router.get('/admin/students/:roll/attendance', adminController.getAttendance);

// Issue log routes
router.get('/admin/issues/:gradeId/:section', adminController.getDisciplineIssues);
router.get('/admin/issues/search/:gradeId', adminController.searchDisciplineIssues);

// Backlogs routes
router.get('/admin/backlogs/:gradeId/:section', adminController.getStudentBacklogs);
router.get('/admin/backlogs/search/:gradeId', adminController.searchStudentBacklogs);

module.exports = router;