const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const coordinatorEnrolment = require('../controllers/admin/coordinatorEnrolment');
const performanceGraph = require('../controllers/admin/performanceGraph')
const freeHourMentor = require('../controllers/admin/freeHourMentor');
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

//Student mentor change
router.get('/admin/students/mentors', adminController.searchMentors);
router.post('/admin/students/updateMentor', adminController.updateStudentMentor);
//Do not change the order of the above two routes, as the first one is used in the MentorSelectModal.js file
// Student details routes
router.get('/admin/students/:studentId', adminController.getStudentDetails);
router.post('/admin/students/getSubjectMentors', adminController.getSubjectMentors);
router.get('/admin/students/:roll/attendance', adminController.getAttendance);
router.get('/admin/students/getStudentIssueLogs/:roll', adminController.getStudentIssueLogs);

// Issue log routes
router.get('/admin/sections/:sectionId/discipline-issues', adminController.getStudentDisciplineLogs);
router.get('/admin/issues/search/:gradeId', adminController.searchDisciplineIssues);

// Backlogs routes
router.get('/admin/backlogs/:sectionId', adminController.getStudentBacklogs);
router.get('/admin/backlogs/search/:gradeId', adminController.searchStudentBacklogs);

//Performance Graph
router.get('/admin/students/:roll/performance', performanceGraph.getPerformanceData);

//Delete Schedule
router.post('/admin/schedules/cancel', adminController.deleteSchedulesByGradeAndDate);

// Free hour routes
// Get all mentors with free hours
router.get('/admin/getFreeHour', freeHourMentor.getFreeHour);
// Get all free hour tasks
router.get('/admin/getFreeHourActivity/', freeHourMentor.getFreeHourActivity);
// Assign a free hour task
router.post('/admin/assignFreeHour', freeHourMentor.assignFreeHour);
// Mark a free hour task as completed
router.put('/admin/tasks/:taskId/complete', freeHourMentor.completeFreeHour);
// Get activity types
router.get('/admin/getActivity', freeHourMentor.getActivity);

router.get('/admin/getSelectedFreeHourActivity/', freeHourMentor.getSelectedFreeHourActivity);

router.get('/admin/generateDailyFreeSlots', freeHourMentor.generateDailyFreeSlots);
 
// Coordinator Enrolment
router.post(
  '/admin/enrollCoordinator',
  uploadCoordinatorProfile.single('profilePhoto'),
  coordinatorEnrolment.enrollCoordinator
);

// Coordinator List
router.get('/admin/getAllCoordinators', adminController.getAllCoordinators);
router.post('/admin/getRoles', adminController.getRoles);
//Leave Approval
router.get('/admin/getPendingLeaveRequests', adminController.getPendingLeaveRequests);
router.get('/admin/getLeaveRequestHistory', adminController.getLeaveRequestHistory);
router.post('/admin/updateLeaveRequestStatus', adminController.updateLeaveRequestStatus);

//Logs
router.get('/admin/getRequestedVenues', adminController.getRequestedVenues);
router.post('/admin/updateVenueStatus', adminController.updateVenueStatus);
router.get('/admin/getUnstartedClassesAdmin', adminController.getUnstartedClassesAdmin);
router.get('/admin/getAssessmentRequestsAdmin', adminController.getAssessmentRequestsAdmin);
router.post('/admin/processAssessmentRequestAdmin', adminController.processAssessmentRequestAdmin);
router.get('/admin/getAllAdminLogs', adminController.getAllAdminLogs);

module.exports = router;