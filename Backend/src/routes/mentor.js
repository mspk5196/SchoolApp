const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');
const surveyController = require('../controllers/mentor/survey');
const HomeworkController = require('../controllers/mentor/homeworkController');
const AssessmentController = require('../controllers/mentor/assessmentController');
const PenaltyController = require('../controllers/mentor/penaltyController');
const MentorTopicHierarchyController = require('../controllers/mentor/topicHierarchyController');
const MentorBatchManagementController = require('../controllers/mentor/batchManagementController');

router.post('/mentor/getMentorData', mentorController.getMentorData);
router.get('/mentor/getGrades', mentorController.getGrades);
router.get('/mentor/getGradeSection', mentorController.getGradeSections);

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
router.get('/mentor/getTopicMaterials', mentorController.getTopicMaterials);
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
router.post('/mentor/survey/feedback', surveyController.createSurvey);
router.get('/mentor/survey/response/:surveyId/:studentId', surveyController.getStudentSurveyResponse);


//Assessment
router.post('/mentor/getAvailableTimeSlots', mentorController.getAvailableTimeSlots);
router.post('/mentor/getAssessmentRequests', mentorController.getAssessmentRequests);
router.post('/mentor/getAssessmentRequestStudents', mentorController.getAssessmentRequestStudents);
router.post('/mentor/getSectionsByGrade', mentorController.getSectionsByGrade);
router.post('/mentor/getSubjectsForGradeSection', mentorController.getSubjectsForGradeSection);
router.post('/mentor/getStudentsForGradeSection', mentorController.getStudentsForGradeSection);
router.post('/mentor/createAssessmentRequest', mentorController.createAssessmentRequest);

//Dashboard
// Fetches the daily schedule for a mentor from period_activities
router.post('/mentor/daily-schedule', mentorController.getMentorDailySchedule);

// Universal endpoint to start any activity
// router.post('/mentor/activity/:activityId/:activityType/start', mentorController.startActivity);

// // Academic Session Endpoints
router.get('/mentor/activity/:activityId/academic', mentorController.getAcademicActivityDetails);
// router.post('/mentor/activity/:activityId/academic/finish', mentorController.finishAcademicActivity);
// router.post('/mentor/activity/:activityId/academic/complete', mentorController.completeAcademicActivity);

// Assessment Session Endpoints
// router.get('/mentor/activity/:activityId/assessment', mentorController.getAssessmentActivityDetails);
// router.post('/mentor/activity/:activityId/assessment/complete', mentorController.completeAssessmentActivity);

// This cron-trigger endpoint can be secured or removed in production
router.post('/mentor/sessions/update-statuses', mentorController.triggerActivityStatusUpdate);

//Dashboard Academics

// router.post('/mentor/create-today-sessions', mentorController.createTodayAcademicSessions);
// router.get('/mentor/academic-session/:sessionId', mentorController.getAcademicSession);
// router.post('/mentor/academic-session/:sessionId/start', mentorController.academicSessionStart);
// router.post('/mentor/academic-session/:sessionId/attendance', mentorController.academicSessionAttendance);
// router.post('/mentor/academic-session/:sessionId/complete', mentorController.academicSessionComplete);
router.get('/mentor/students', mentorController.getSectionStudents);
router.get('/mentor/check-approved-leaves', mentorController.checkApprovedLeaves);
router.post('/mentor/update-leave-days', mentorController.updateLeaveDays);

//Dashboard Assessment


router.get('/mentor/activity/:activityId/assessment', mentorController.getAssessmentActivityDetails);
router.post('/mentor/activity/:activityId/assessment/finish', mentorController.finishAssessmentActivity);
router.post('/mentor/activity/:activityId/assessment/complete', mentorController.completeAssessmentActivity)
router.post('/mentor/getAbsentees', mentorController.getAbsentees);

//Edit Daily Schedule
router.post('/mentor/getSectionSubjectsforSchedule', mentorController.getSectionSubjectsforSchedule);
router.post('/mentor/getMentorForSubject', mentorController.getMentorForSubject);
router.post('/mentor/updateDailySchedule', mentorController.updateDailySchedule);
router.post('/mentor/updateDailyScheduleActivity', mentorController.updateDailyScheduleActivity);

//Dashboard Attention
router.get('/mentor/getOverdueStudents', mentorController.getOverdueStudents);
router.get('/mentor/getCoordinatorTasks', mentorController.getCoordinatorTasks);
router.post('/mentor/accept-task', mentorController.acceptTask);
router.post('/mentor/checkOverdueLevels', mentorController.checkOverdueLevels);

// Enhanced Homework Management Routes
//Homework

router.get('/mentor/getHomeworkList', HomeworkController.getHomeworkList);
router.get('/mentor/getHomeworkDetails', HomeworkController.getHomeworkDetails);
router.post('/mentor/updateHomeworkStatus', HomeworkController.bulkUpdateHomeworkStatus);
router.post('/mentor/addHomework', HomeworkController.addHomework);
router.post('/mentor/getSectionSubjects', mentorController.getSectionSubjects);


// Enhanced Assessment Management Routes
router.post('/assessment/schedule', AssessmentController.scheduleAssessment);
router.patch('/assessment/score/:assessmentId', AssessmentController.recordAssessmentScore);
router.get('/assessment/scheduled/:mentorId', AssessmentController.getScheduledAssessments);
router.get('/assessment/history/:studentRoll', AssessmentController.getStudentAssessmentHistory);
router.get('/assessment/analytics/:subjectId/:gradeId', AssessmentController.getAssessmentAnalytics);
router.post('/assessment/request', AssessmentController.requestAssessment);
router.get('/assessment/requests/:gradeId/:subjectId', AssessmentController.getAssessmentRequests);
router.patch('/assessment/approve/:requestId', AssessmentController.approveAssessmentRequest);

// Enhanced Penalty Management Routes
router.get('/penalty/status/:mentorId', PenaltyController.getPenaltyStatus);
router.get('/penalty/remedial/:mentorId', PenaltyController.getRemedialSessions);
router.patch('/penalty/remedial/:sessionId', PenaltyController.updateRemedialSession);
router.post('/penalty/assign', PenaltyController.assignPenalty);
router.patch('/penalty/clear', PenaltyController.clearPenalty);
router.get('/penalty/statistics/:gradeId/:subjectId', PenaltyController.getPenaltyStatistics);
router.get('/penalty/trends/:gradeId/:subjectId', PenaltyController.getPenaltyTrends);
router.get('/penalty/history/:studentRoll', PenaltyController.getStudentPenaltyHistory);

// Topic Hierarchy Routes (Mentor View - Read Only)
router.post('/mentor/topic-hierarchy/get', MentorTopicHierarchyController.getTopicHierarchy);
router.post('/mentor/topic-hierarchy/getByActivityId', MentorTopicHierarchyController.getTopicHierarchyByActivity);
router.get('/mentor/topic-hierarchy/materials/:topicId', MentorTopicHierarchyController.getTopicMaterials);
router.post('/mentor/topic-hierarchy/activities', MentorTopicHierarchyController.getSectionSubjectActivitiesRecords);
router.post('/mentor/topic-hierarchy/sub-activities', MentorTopicHierarchyController.getSectionSubjectSubActivitiesRecords);
router.post('/mentor/topic-hierarchy/student-progress', MentorTopicHierarchyController.getStudentTopicProgress);

// Batch Management Routes (Mentor View - Read Only)
router.get('/mentor/batches/:sectionId/:subjectId', MentorBatchManagementController.getBatches);
router.post('/mentor/batches/details', MentorBatchManagementController.getBatchDetails);
router.get('/mentor/batches/analytics/:sectionId/:subjectId', MentorBatchManagementController.getBatchAnalytics);
router.post('/mentor/batch-subjects', MentorBatchManagementController.getSectionSubjects);

// Activity Management Routes
router.post('/mentor/activity/:activityId/:activityType/start', mentorController.startActivity);
router.post('/mentor/activity/:activityId/academic/finish', mentorController.finishAcademicActivity);
router.post('/mentor/activity/:activityId/academic/complete', mentorController.completeAcademicActivity);
router.get('/mentor/activity/:activityId/details', mentorController.getAcademicActivityDetails);
router.post('/mentor/activity/:activityId/status', mentorController.getActivityStatus);

module.exports = router;