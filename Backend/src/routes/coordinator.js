const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinator/coordinatorController');
const infraEnrollment = require('../controllers/coordinator/infrastructreEnrollment');
const TopicHierarchyController = require('../controllers/coordinator/topicHierarchyController');
const BatchManagementController = require('../controllers/coordinator/batchManagementController');
const ScheduleManagementController = require('../controllers/coordinator/scheduleManagementController');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure multer
const upload = multer({
  dest: './uploads/documents',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const materialsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/materials');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadMaterials = multer({
  storage: materialsStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 50MB limit for large study content
});

const profileStudentPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profileImages/students'); // Your desired folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const uploadStudentProfile = multer({ storage:profileStudentPhotoStorage });

module.exports = uploadStudentProfile;

const profileMentorPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profileImages/mentor'); // Your desired folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const uploadMentorProfile = multer({ storage:profileMentorPhotoStorage });

module.exports = uploadMentorProfile;

const coordinatorEventBanner = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/events/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadEventBanner = multer({ storage: coordinatorEventBanner });
module.exports = uploadEventBanner;


// Coordinator routes
router.post('/coordinator/getCoordinatorData', coordinatorController.getCoordinatorData);
router.post('/coordinator/getCoordinatorGrades', coordinatorController.getCoordinatorGrades);
router.post('/coordinator/coordinatorMentors', coordinatorController.coordinatorMentors);
router.post('/coordinator/coordinatorStudents', coordinatorController.coordinatorStudents);

//Profile
router.post('/coordinator/getAttendance', coordinatorController.getAttendance);
router.post('/coordinator/submitLeaveRequest', coordinatorController.submitLeaveRequest);
router.post('/coordinator/getLeaveHistory', coordinatorController.getLeaveHistory);
router.post('/coordinator/getMentorAssignments', coordinatorController.getMentorAssignments);
router.post('/coordinator/getMentorSection', coordinatorController.getMentorSection);
router.post('/coordinator/getMentorIssues', coordinatorController.getMentorIssues);

//StudentRequests
router.get('/coordinator/fetchDocumentPurpose', coordinatorController.fetchDocumentPurpose);
router.post('/coordinator/insertDocPurpose', coordinatorController.insertDocPurpose);
router.post('/coordinator/insertDocType', coordinatorController.insertDocType);
router.post('/coordinator/getStudentCoordinatorRequests', coordinatorController.getStudentCoordinatorRequests);
router.post(
  '/coordinator/uploadRequestDocuments',
  upload.array('files', 10), // Allow up to 10 files
  coordinatorController.uploadRequestDocuments
);

//Materials
router.post('/coordinator/getGradeSubject', coordinatorController.getGradeSubject);
router.post(
  '/coordinator/uploadStudyMaterial',
  uploadMaterials.array('files', 10),  // frontend must use `files` as the field name
  coordinatorController.uploadStudyMaterial
);
router.get('/coordinator/getMaterials', coordinatorController.getMaterials);
router.delete('/coordinator/deleteMaterial', coordinatorController.deleteMaterial);
router.delete('/coordinator/deleteLevel', coordinatorController.deleteLevel);
router.put('/coordinator/updateExpectedDate', coordinatorController.updateExpectedDate);
//LevelPromotion
router.get('/coordinator/getLevelPassPercentages', coordinatorController.getLevelPassPercentages);
router.put('/coordinator/updateLevelPassPercentages', coordinatorController.updateLevelPassPercentages);


//SubjectEnrollment
router.post('/coordinator/getGradeSections', coordinatorController.getGradeSections);
router.get('/coordinator/getSubjects', coordinatorController.getSubjects);
router.get('/coordinator/getActivities', coordinatorController.getActivities);
router.post('/coordinator/getSubjectActivities', coordinatorController.getSubjectActivities);
router.post('/coordinator/addSubjectActivity', coordinatorController.addSubjectActivity);
router.post('/coordinator/removeSubjectActivity', coordinatorController.removeSubjectActivity);
router.post('/coordinator/removeSubject', coordinatorController.removeSubject);
router.post('/coordinator/addSubjectToSection', coordinatorController.addSubjectToSection);
router.post('/coordinator/addSubjects', coordinatorController.addSubjects);
router.post('/coordinator/addActivities', coordinatorController.addActivities);

//InfrastructureEnrollemt
router.get('/coordinator/enrollment/getAllVenues/', infraEnrollment.getAllVenues);
router.post('/coordinator/enrollment/createVenue', infraEnrollment.createVenue);
router.delete('/coordinator/enrollment/deleteVenue/:id', infraEnrollment.deleteVenue);
router.get('/coordinator/enrollment/getVenueById/:id', infraEnrollment.getVenueById);
router.put('/coordinator/enrollment/updateVenue/:id', infraEnrollment.updateVenue);
router.put('/coordinator/enrollment/updateVenueStatus/:id', infraEnrollment.updateVenueStatus);
router.get('/coordinator/enrollment/getGrades', infraEnrollment.getGrades);
router.get('/coordinator/enrollment/getSubjects', infraEnrollment.getSubjects);
router.get('/coordinator/enrollment/getBlocks', infraEnrollment.getBlocks);
// Admin approval routes
router.put('/coordinator/enrollment/approveVenue/:id', infraEnrollment.approveVenue);
router.put('/coordinator/enrollment/rejectVenue/:id', infraEnrollment.rejectVenue);
router.get('/coordinator/enrollment/getPendingVenues', infraEnrollment.getPendingVenues);


//StudentEnrollment
router.get('/coordinator/getGrades', coordinatorController.getGrades);
router.post(
  '/coordinator/enrollStudent',
  uploadStudentProfile.single('profilePhoto'), // matches FormData key
  coordinatorController.enrollStudent
);
router.post('/coordinator/getSpecificSectionMentor',coordinatorController.getSpecificSectionMentor)
router.post(
  '/coordinator/enrollMentor',
  uploadMentorProfile.single('profilePhoto'), // matches FormData key
  coordinatorController.enrollMentor
);

// Create/update academic schedule
// router.post('/coordinator/academic-schedule/schedule-add', coordinatorController.createOrUpdateSchedule);
// router.get('/coordinator/academic-schedule/getShedule/:section_id/:day', coordinatorController.getSchedule);

//ExamSchedule
router.get('/coordinator/getExamSchedule', coordinatorController.getExamSchedule);
router.post('/coordinator/createExamSchedule', coordinatorController.createExamSchedule);
router.post('/coordinator/updateExamSchedule', coordinatorController.updateExamSchedule);
router.post('/coordinator/deleteExamSchedule', coordinatorController.deleteExamSchedule);
router.post('/coordinator/deleteConflictingSchedules', coordinatorController.deleteConflictingSchedules);
//WeeklySchedule
router.get('/coordinator/weekly-schedule/getWeeklySchedule', coordinatorController.getWeeklySchedule);
router.post('/coordinator/weekly-schedule/addOrUpdateWeeklySchedule', coordinatorController.addOrUpdateWeeklySchedule);
router.delete('/coordinator/weekly-schedule/deleteWeeklySchedule/:id', coordinatorController.deleteWeeklySchedule);
router.get('/coordinator/weekly-schedule/getAvailableMentors', coordinatorController.getAvailableMentors);
router.post('/coordinator/weekly-schedule/subjects', coordinatorController.getAllSubjects);
router.post('/coordinator/weekly-schedule/sections', coordinatorController.getSectionsByGrade);
router.get('/coordinator/weekly-schedule/getSectionSubjectActivities', coordinatorController.getSectionSubjectActivities);
router.get('/coordinator/weekly-schedule/checkTimeConflict', coordinatorController.checkTimeConflict);
router.get('/coordinator/enrollment/getVenuesByGrade', infraEnrollment.getVenuesByGrade);
// Invigilation duties
router.get('/coordinator/getExamScheduleWithInvigilators', coordinatorController.getExamScheduleWithInvigilators);
router.post('/coordinator/assignInvigilators', coordinatorController.assignInvigilators);
router.get('/coordinator/getAvailableMentorsForInvigilation', coordinatorController.getAvailableMentorsForInvigilation);

//StudentsPage
router.post('/coordinator/student/getSectionStudents', coordinatorController.getSectionStudents);

//Discipline
router.post('/coordinator/student/addStudentComplaint', coordinatorController.addStudentComplaint);
router.get('/coordinator/student/getStudentDisciplineLogs', coordinatorController.getStudentDisciplineLogs);
router.get('/coordinator/student/getStudentList', coordinatorController.getStudentList);

//MentorPage
router.post('/coordinator/mentor/getGradeMentors', coordinatorController.getGradeMentors);
router.post('/coordinator/mentor/getSectionMentor', coordinatorController.getSectionMentor);
router.post('/coordinator/mentor/getGradeNonEnroledMentors', coordinatorController.getGradeNonEnroledMentors);
router.post('/coordinator/mentor/assignMentorToSection', coordinatorController.assignMentorToSection);
router.post('/coordinator/createSection', coordinatorController.createSection);
router.post('/coordinator/mentor/getMentorSectionStudents', coordinatorController.getMentorSectionStudents);
router.post('/coordinator/mentor/getMentorGradeSubject', coordinatorController.getMentorGradeSubject);
router.post('/coordinator/mentor/getSubjectGradeMentor', coordinatorController.getSubjectGradeMentor);
router.post('/coordinator/mentor/getGradeSubjects', coordinatorController.getGradeSubjects);
router.post('/coordinator/mentor/assignMentorToSubject', coordinatorController.assignMentorToSubject);
router.post('/coordinator/mentor/assignSubjectToMentorSection', coordinatorController.assignSubjectToMentorSection);
router.post('/coordinator/mentor/getEnroledSubjectMentors', coordinatorController.getEnroledSubjectMentors);
router.post('/coordinator/mentor/getEnroledGradeSubjectMentor', coordinatorController.getEnroledGradeSubjectMentor);
router.post('/coordinator/mentor/getMentorSchedule', coordinatorController.getMentorSchedule);
router.post('/coordinator/mentor/available-substitute-mentors', coordinatorController.getAvailableMentorsForSubstitution);
router.post('/coordinator/mentor/substitute-mentor', coordinatorController.updateMentorSubstitution);
//Discipline
router.post('/coordinator/mentor/addFacultyComplaint', coordinatorController.addFacultyComplaint);
router.get('/coordinator/mentor/getDisciplineLogs', coordinatorController.getDisciplineLogs);
router.get('/coordinator/mentor/getFacultyList', coordinatorController.getFacultyList);
//LeaveApproval
router.post('/coordinator/getMentorLeaveRequests', coordinatorController.getMentorLeaveRequests);
router.post('/coordinator/getMentorLeaveHistory', coordinatorController.getMentorLeaveHistory);
router.post('/coordinator/getAvailableMentorsForDate', coordinatorController.getAvailableMentorsForDate);
router.post('/coordinator/approveMentorLeave', coordinatorController.approveMentorLeave);
router.post('/coordinator/rejectMentorLeave', coordinatorController.rejectMentorLeave);
router.post('/coordinator/getAllMentorLeaveHistory', coordinatorController.getAllMentorLeaveHistory);

//Events
router.post('/coordinator/events/create', uploadEventBanner.single('bannerPhoto'),coordinatorController.createEvent);
router.get('/coordinator/events/get', coordinatorController.getEvents);
router.delete('/coordinator/events/delete', coordinatorController.deleteEvent);

//Calendar Page
router.get('/coordinator/calendar/events', coordinatorController.getCalendarEvents);
router.post('/coordinator/calendar/events', coordinatorController.addCalendarEvent);
router.delete('/coordinator/calendar/events', coordinatorController.deleteCalendarEvent);

//Logs
router.post('/coordinator/getOverdueClasses', coordinatorController.getOverdueClasses);
router.post('/coordinator/getOverdueStudentLevels', coordinatorController.getOverdueStudentLevels);
router.post('/coordinator/assignTask', coordinatorController.assignTask);
router.post('/coordinator/getRequestedAssessments', coordinatorController.getRequestedAssessments);
router.post('/coordinator/processAssessmentRequest', coordinatorController.processAssessmentRequest);

// Enhanced Topic Hierarchy Routes
router.get('/topics/hierarchy/:subjectId/:gradeId', TopicHierarchyController.getTopicHierarchy);
router.post('/topics/create', TopicHierarchyController.createTopic);
router.put('/topics/:topicId', TopicHierarchyController.updateTopic);
router.delete('/topics/:topicId', TopicHierarchyController.deleteTopic);
router.get('/topics/:topicId/materials', TopicHierarchyController.getTopicMaterials);
// router.post('/topics/materials/add', TopicHierarchyController.uploadTopicMaterials);
router.post(
  '/topics/materials/upload',
  uploadMaterials.array('files', 10),  // frontend must use `files` as the field name
  TopicHierarchyController.uploadTopicMaterials
);
router.delete('/topics/materials/:materialId', TopicHierarchyController.deleteMaterial);
router.get('/topics/materials/download/:filename', TopicHierarchyController.downloadFile);
router.get('/topics/materials/view/:filename', TopicHierarchyController.viewFile);
router.get('/topics/assessment-eligible/:studentRoll/:subjectId', TopicHierarchyController.getAssessmentEligibleTopics);
router.get('/students/:studentRoll/progress/:subjectId', TopicHierarchyController.getStudentProgress);
router.post('/students/progress/update', TopicHierarchyController.updateStudentProgress);

// Enhanced Batch Management Routes
router.get('/batches/:sectionId/:subjectId', BatchManagementController.getBatches);
router.post('/batches/details', BatchManagementController.getBatchDetails);
router.post('/batches/configure', BatchManagementController.configureBatches);
router.get('/batches/:batchId/students', BatchManagementController.getBatchStudents);
router.post('/batches/move-student', BatchManagementController.moveStudentToBatch);
router.get('/batches/history/:studentRoll/:subjectId', BatchManagementController.getBatchHistory);
router.post('/batches/reallocate', BatchManagementController.runBatchReallocation);
router.get('/batches/analytics/:sectionId/:subjectId', BatchManagementController.getBatchAnalytics);
router.post('/batches/initialize', BatchManagementController.initializeStudentBatches);
router.post('/batches/getSectionSubjects', BatchManagementController.getSectionSubjects);

// Enhanced Schedule Management Routes
router.post('/schedule/create', ScheduleManagementController.createDailySchedule);
router.get('/schedule/:date/:sectionId', ScheduleManagementController.getDailySchedule);
router.get('/schedule/weekly/:sectionId/:weekStart', ScheduleManagementController.getWeeklySchedule);
router.put('/schedule/activity/:activityId', ScheduleManagementController.updateScheduleActivity);
router.patch('/schedule/activity/:activityId/complete', ScheduleManagementController.markActivityCompleted);
router.get('/schedule/mentors/available/:date/:startTime/:endTime/:subjectId/:gradeId', ScheduleManagementController.getAvailableMentors);
router.get('/schedule/venues/available/:date/:startTime/:endTime/:subjectId/:gradeId', ScheduleManagementController.getAvailableVenues);
router.delete('/schedule/:scheduleId', ScheduleManagementController.deleteSchedule);
router.post('/schedule/:scheduleId/copy', ScheduleManagementController.copySchedule);

module.exports = router;
