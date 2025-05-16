const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');
const surveyController = require('../controllers/mentor/survey');

router.post('/mentor/getMentorData', mentorController.getMentorData);
router.get('/mentor/getGrades', mentorController.getGrades);

//Profile
router.post('/mentor/getMentorAttendance', mentorController.getMentorAttendance);
router.post('/mentor/submitLeaveRequest', mentorController.submitLeaveRequest);
router.post('/mentor/getLeaveHistory', mentorController.getLeaveHistory);
router.post('/mentor/getMentorAssignments', mentorController.getMentorAssignments);
router.post('/mentor/getMentorSection', mentorController.getMentorSection);
router.post('/mentor/getMentorIssues', mentorController.getMentorIssues);

//Materials
router.post('/mentor/getGradeSubject', mentorController.getGradeSubject);
router.get('/mentor/getMaterials', mentorController.getMaterials);
router.put('/mentor/updateExpectedDate', mentorController.updateExpectedDate);

//Leave Approval
router.post('/mentor/getPendingLeaveRequests', mentorController.getPendingLeaveRequests);
router.post('/mentor/getLeaveRequestHistory', mentorController.getLeaveRequestHistory);
router.post('/mentor/updateLeaveRequestStatus', mentorController.updateLeaveRequestStatus);

//BufferActivity
// Get all grades
router.get('/mentor/grades', mentorController.getGrades);
// Get sections by grade
router.get('/mentor/sections/:gradeId', mentorController.getSectionsByGrade);
// Get activity types
router.get('/mentor/activity-types', mentorController.getActivityTypes);
// Create buffer activity
router.post('/mentor/create-buffer-activity', mentorController.createBufferActivity);
// Get buffer activities for mentor
router.post('/mentor/buffer-activities', mentorController.getBufferActivities);
// End buffer activity
router.post('/mentor/end-buffer-activity', mentorController.endBufferActivity);

//General Activity
router.post('/mentor/getMentorStudents', mentorController.getMentorStudents);
router.post('/mentor/createGeneralActivity', mentorController.createGeneralActivity);
router.get('/mentor/getGeneralActivities', mentorController.getGeneralActivities);

//EmergencyLeave
router.post('/mentor/getMentorStudentsForLeave', mentorController.getMentorStudentsForLeave);
router.post('/mentor/createEmergencyLeave', mentorController.createEmergencyLeave);
router.get('/mentor/getEmergencyLeaveHistory', mentorController.getEmergencyLeaveHistory);


//Survey
// Create a new survey
router.post('/mentor/survey/create', surveyController.createSurvey);
router.get('/mentor/survey/getGrades', surveyController.getGrades);
router.get('/mentor/survey/getGradeSections', surveyController.getSectionsByGrade);
router.get('/mentor/survey/getMentorStudents', surveyController.getMentorStudents);

// Get surveys for mentor
router.get('/mentor/survey/mentor/:mentorId', surveyController.getMentorSurveys);
router.get('/mentor/survey/:surveyId/students', surveyController.getSurveyStudents);

// End a survey
router.put('/mentor/survey/end/:surveyId', surveyController.endSurvey);

// Submit feedback response
router.post('/mentor/survey/feedback', surveyController.submitFeedback);


//Assessment
router.post('/mentor/getAvailableTimeSlots', mentorController.getAvailableTimeSlots);
router.post('/mentor/getAssessmentRequests', mentorController.getAssessmentRequests);
router.post('/mentor/getAssessmentStudents', mentorController.getAssessmentStudents);
router.post('/mentor/getSectionsByGrade', mentorController.getSectionsByGrade);
router.post('/mentor/getSubjectsForGradeSection', mentorController.getSubjectsForGradeSection);
router.post('/mentor/getStudentsForGradeSection', mentorController.getStudentsForGradeSection);
router.post('/mentor/createAssessmentRequest', mentorController.createAssessmentRequest);

//Homework

router.get('/mentor/getHomeworkList', mentorController.getHomeworkList);
router.get('/mentor/getHomeworkDetails', mentorController.getHomeworkDetails);
router.post('/mentor/updateHomeworkStatus', mentorController.bulkUpdateHomeworkStatus);
router.get('/mentor/getLevels', mentorController.getLevels);
router.post('/mentor/addHomework', mentorController.addHomework);
router.post('/mentor/getSectionSubjects', mentorController.getSectionSubjects);

module.exports = router;