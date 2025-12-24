const express = require('express');
const router = express.Router();
const multer = require('multer');
const enrollmentController = require('../controllers/coordinator/enrollmentController');
const coordinatorController = require('../controllers/coordinator/coordinatorController');
const subjectAllotmentController = require('../controllers/coordinator/subjectAllotmentController');
const materialController = require('../controllers/coordinator/materialController');
const scheduleController = require('../controllers/coordinator/scheduleController');
const infrastructureEnrollment = require('../controllers/coordinator/infrastructureController');
const academicCalendarController = require('../controllers/coordinator/academicCalendarController');
const { authenticateToken } = require('../middleware/auth');
const getAcademicYear = require('../middleware/getAcademicYear');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(authenticateToken);
router.use(getAcademicYear);

// Section management routes
router.post('/enrollment/getSectionsByGrade', enrollmentController.getSectionsByGrade);
router.post('/enrollment/createSection', enrollmentController.createSection);
router.post('/enrollment/deleteSection', enrollmentController.deleteSection);
// Infrastructure / Venues
router.get('/enrollment/getBlocks', infrastructureEnrollment.getBlocks);
router.get('/enrollment/getAllVenues', infrastructureEnrollment.getAllVenues);
router.post('/enrollment/createVenue', infrastructureEnrollment.createVenue);
router.put('/enrollment/updateVenue/:id', infrastructureEnrollment.updateVenue);
router.delete('/enrollment/deleteVenue/:id', infrastructureEnrollment.deleteVenue);
router.put('/enrollment/updateVenueStatus/:id', infrastructureEnrollment.updateVenueStatus);

// Venue Mapping
router.get('/enrollment/mapping/grades', infrastructureEnrollment.getGradesForMapping);
router.post('/enrollment/mapping/sections', infrastructureEnrollment.getSectionsForMapping);
router.post('/enrollment/mapping/batches', infrastructureEnrollment.getBatchesForMapping);
router.post('/enrollment/mapping/activities', infrastructureEnrollment.getActivitiesForMapping);
router.post('/enrollment/mapping/get', infrastructureEnrollment.getVenueMappings);
router.post('/enrollment/mapping/create', infrastructureEnrollment.createVenueMapping);
router.post('/enrollment/mapping/delete', infrastructureEnrollment.deleteVenueMapping);
router.post('/enrollment/mapping/activate', infrastructureEnrollment.activateVenueMapping);

// Student enrollment routes
router.post('/enrollment/enrollStudent', enrollmentController.enrollStudent);
router.get('/enrollment/generate-student-enroll-template', enrollmentController.generateStudentEnrollTemplate);
router.post('/enrollment/bulk-upload-students', upload.single('file'), enrollmentController.bulkUploadStudents);

// Mentor assignment routes
router.post('/getSectionsWithMentors', coordinatorController.getSectionsWithMentors);
router.get('/getUnassignedMentors', coordinatorController.getUnassignedMentors);
router.post('/assignMentorToSection', coordinatorController.assignMentorToSection);
router.post('/unassignMentorFromSection', coordinatorController.unassignMentorFromSection);
router.post('/getStudentsBySection', coordinatorController.getStudentsBySection);

// Subject-mentor mapping routes
router.post('/mentor/getMentorGradeSubject', coordinatorController.getMentorGradeSubject);
router.post('/mentor/getSubjectGradeMentors', coordinatorController.getSubjectGradeMentors);
router.post('/mentor/getEnroledSubjectMentors', coordinatorController.getEnroledSubjectMentors);
router.post('/mentor/assignMentorToSubject', coordinatorController.assignMentorToSubject);
router.post('/mentor/removeEnroledSubjectMentor', coordinatorController.removeEnroledSubjectMentor);

// Mentor list and details routes
router.post('/mentor/getGradeMentors', coordinatorController.getGradeMentors);
router.post('/mentor/getMentorSchedule', coordinatorController.getMentorSchedule);
router.post('/mentor/getMentorDetails', coordinatorController.getMentorDetails);

// Faculty issue routes
router.post('/mentor/getFacultyIssues', coordinatorController.getFacultyIssues);
router.post('/mentor/createFacultyIssue', coordinatorController.createFacultyIssue);
router.post('/mentor/getFacultyIssueCount', coordinatorController.getFacultyIssueCount);
router.post('/mentor/getGradeMentorsForIssues', coordinatorController.getGradeMentorsForIssues);

// Subject allotment routes
router.post('/getGradeSections', subjectAllotmentController.getGradeSections);
router.get('/getSubjects', subjectAllotmentController.getSubjects);
router.get('/getActivities', subjectAllotmentController.getActivities);
router.get('/getSubActivities', subjectAllotmentController.getSubActivities);
router.post('/getSubjectActivities', subjectAllotmentController.getSubjectActivities);
router.post('/addSubjectToSection', subjectAllotmentController.addSubjectToSection);
router.post('/removeSubject', subjectAllotmentController.removeSubject);
router.post('/addSubjectActivity', subjectAllotmentController.addSubjectActivity);
router.post('/removeSubjectActivity', subjectAllotmentController.removeSubjectActivity);
router.post('/addSubjectSubActivity', subjectAllotmentController.addSubjectSubActivity);
router.post('/removeSubjectSubActivity', subjectAllotmentController.removeSubjectSubActivity);
router.post('/addSubjects', subjectAllotmentController.addSubjects);
router.post('/addActivities', subjectAllotmentController.addActivities);
router.post('/addSubActivities', subjectAllotmentController.addSubActivities);

// Batch management routes
router.post('/batch/getBatches', materialController.getBatches);
router.post('/batch/getBatchAnalytics', materialController.getBatchAnalytics);
router.post('/batch/initializeBatches',  materialController.initializeBatches);
router.post('/batch/reallocateBatches',  materialController.reallocateBatches);
router.post('/batch/updateBatchSize', materialController.updateBatchSize);
router.post('/batch/getBatchDetails', materialController.getBatchDetails);
router.post('/batch/moveStudentBatch', materialController.moveStudentBatch);
router.post('/batch/getBatchStudents', materialController.getBatchStudents);
router.post('/batch/moveMultipleStudents', materialController.moveMultipleStudents);
// New: configure batches (create batch records without assigning students)
router.post('/batches/configure',  materialController.configureBatches);
// Assign students to batches (manual assignment)
router.post('/batch/assignStudents', materialController.assignStudents);
// Topic hierarchy routes
router.post('/topic/getTopicHierarchy',  materialController.getTopicHierarchy);
router.post('/topic/createTopic',  materialController.createTopic);
router.post('/topic/updateTopic',  materialController.updateTopic);
router.post('/topic/deleteTopic',  materialController.deleteTopic);
router.post('/topic/getActivitiesForSubject',  materialController.getActivitiesForSubject);
router.post('/topic/getSubActivitiesForActivity',  materialController.getSubActivitiesForActivity);

// Material management routes
router.post('/material/getTopicMaterials',  materialController.getTopicMaterials);
router.post('/material/addTopicMaterial',  materialController.addTopicMaterial);
router.post('/material/updateTopicMaterial',  materialController.updateTopicMaterial);
router.post('/material/deleteTopicMaterial',  materialController.deleteTopicMaterial);
router.post('/material/setExpectedCompletionDate',  materialController.setExpectedCompletionDate);
router.post('/material/getBatchExpectedDates',  materialController.getBatchExpectedDates);

// Question paper routes
router.post('/material/getQuestionPapers', materialController.getQuestionPapers);
router.post('/material/addQuestionPaper', materialController.addQuestionPaper);
router.post('/material/updateQuestionPaper', materialController.updateQuestionPaper);
router.post('/material/deleteQuestionPaper', materialController.deleteQuestionPaper);
router.post('/material/approveQuestionPaper', materialController.approveQuestionPaper);

// Question paper Excel routes
router.get('/material/question-papers/generate-template', materialController.generateQuestionPaperTemplate);
router.post('/material/question-papers/upload', upload.single('file'), materialController.uploadQuestionPapersFromExcel);

// Excel upload routes
router.get('/batch/generate-batch-template',  materialController.generateBatchTemplate);
router.post('/batch/upload-batches',  upload.single('file'), materialController.uploadBatchesFromExcel);
// router.get('/material/generate-materials-template',  materialController.generateMaterialsTemplate);
// router.post('/material/upload-materials',  upload.single('file'), materialController.uploadMaterialsFromExcel);

// Academic year bulk import/export
router.get('/academic-year/generate-template', materialController.generateAcademicYearTemplate);
router.post('/academic-year/upload', upload.single('file'), materialController.uploadAcademicYearData);

// Utility routes
router.post('/getSectionSubjects',  materialController.getSectionSubjects);


//Schedule
router.get('/schedule/mentor/generate-template', scheduleController.generateMentorScheduleTemplate);
router.post('/schedule/mentor/upload', upload.single('file'), scheduleController.uploadMentorSchedule);

// Faculty schedule CRUD
router.post('/schedule/faculty/list', scheduleController.getFacultySchedules);
router.post('/schedule/faculty/create', scheduleController.createFacultySchedule);
router.post('/schedule/faculty/update', scheduleController.updateFacultySchedule);
router.post('/schedule/faculty/delete', scheduleController.deleteFacultySchedule);

// Context activities hierarchy
router.post('/schedule/context-activities', scheduleController.getContextActivityTree);
router.post('/schedule/context-activities/create', scheduleController.createContextActivity);
router.post('/schedule/context-activities/update', scheduleController.updateContextActivity);
router.post('/schedule/context-activities/delete', scheduleController.deleteContextActivity);

// Student Schedule Management
router.post('/schedule/student/get', scheduleController.getStudentSchedules);
router.post('/schedule/student/get-students', scheduleController.getStudentsBySection);
router.post('/schedule/student/create', scheduleController.createStudentSchedule);
router.post('/schedule/student/update', scheduleController.updateStudentSchedule);
router.post('/schedule/student/delete', scheduleController.deleteStudentSchedule);
router.post('/schedule/student/get-topics', scheduleController.getTopicsForSchedule);
router.post('/schedule/student/get-mentors', scheduleController.getMentorsForSubject);

// Session types & evaluation modes
router.get('/schedule/session-types', scheduleController.getSessionTypes);
router.get('/schedule/evaluation-modes', scheduleController.getEvaluationModes);
router.post('/schedule/session-types/create', scheduleController.createSessionType);
router.post('/schedule/session-types/update', scheduleController.updateSessionType);
router.post('/schedule/session-types/delete', scheduleController.deleteSessionType);

// Assessment cycles
router.post('/schedule/assessment-cycles', scheduleController.getAssessmentCycles);
router.post('/schedule/assessment-cycles/create', scheduleController.createAssessmentCycle);
router.post('/schedule/assessment-cycles/update', scheduleController.updateAssessmentCycle);
router.post('/schedule/assessment-cycles/delete', scheduleController.deleteAssessmentCycle);

// Academic Calendar
router.get('/academic-calendar/generate-template', academicCalendarController.generateAcademicCalendarTemplate);
router.post('/academic-calendar/upload', upload.single('file'), academicCalendarController.uploadAcademicCalendar);
router.post('/academic-calendar/get', academicCalendarController.getAcademicCalendar);
router.post('/academic-calendar/delete', academicCalendarController.deleteAcademicCalendarEntry);
router.post('/academic-calendar/stats', academicCalendarController.getCalendarStats);
router.get('/academic-calendar/day-types', academicCalendarController.getDayTypes);
router.post('/academic-calendar/bulk-update', academicCalendarController.bulkUpdateAcademicCalendar);

module.exports = router;

