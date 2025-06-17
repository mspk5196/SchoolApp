const express = require('express');
const router = express.Router();

const studentController = require('../controllers/student/studentController');
const attendanceCron = require('../controllers/student/attendanceCron');

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

//get sessionAttendance
router.post('/student/getSessionAttendance', studentController.getSessionAttendance);

//PerformanceGraph
router.get('/student/getStudentPerformance/:studentId', studentController.getStudentPerformance);
router.post('/student/getSectionSubjects', studentController.getSectionSubjects);
router.post('/student/getAssessmentDetails', studentController.getAssessmentDetails);
router.post('/student/getAcademicDetails', studentController.getAcademicDetails);
router.post('/student/getExamScheduleBySection', studentController.getExamScheduleBySection);

//Survey
router.get('/student/getStudentSurveys', studentController.getStudentSurveys);
router.post('/student/markSurveyAsRead', studentController.markSurveyAsRead);
router.get('/student/getSurveyQuestions', studentController.getSurveyQuestions);
router.post('/student/submitSurveyResponse', studentController.submitSurveyResponse);

//Schedule
router.post('/student/getStudentScheduleByMonth', studentController.getStudentScheduleByMonth);

//Materials
router.post('/student/getMaterialsAndCompletedLevels', studentController.getMaterialsAndCompletedLevels);

//Student Phonebook
router.post('/student/fetchSectionSubjectMentors', studentController.fetchSectionSubjectMentors);

//Events
router.post('/students/event/studentEventRegistration', studentController.registerEvent);
router.get('/student/events/getRegisteredEvents', studentController.getRegisteredEvents);
router.post('/student/addFavouriteEvent', studentController.addFavouriteEvent);
router.post('/student/removeFavouriteEvent', studentController.removeFavouriteEvent);
router.get('/student/getFavouriteEvents', studentController.getFavouriteEvents);

//Dashboard hw
router.post('/student/getPendingHomework', studentController.getPendingHomework);

// Attendance updater
router.post('/student/attendanceUpdater', attendanceCron.runAttendanceUpdater);
module.exports = router;