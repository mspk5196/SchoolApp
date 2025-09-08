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
router.post('/coordinator/addSubActivities', coordinatorController.addSubActivities);
router.get('/coordinator/getSubActivities', coordinatorController.getSubActivities);
router.post('/coordinator/addSubjectSubActivity', coordinatorController.addSubjectSubActivity);
router.post('/coordinator/removeSubjectSubActivity', coordinatorController.removeSubjectSubActivity);

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

// router.get('/coordinator/weekly-schedule/getSectionSubjectActivities', coordinatorController.getSectionSubjectActivities);
// router.post('/coordinator/weekly-schedule/generateTemplate', coordinatorController.generateWeeklyTemplate);
// router.get('/coordinator/weekly-schedule/getAvailableMentors', coordinatorController.getAvailableMentors);

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
router.post('/coordinator/topics/hierarchy/activity', TopicHierarchyController.getTopicHierarchyByActivity);
router.get('/coordinator/topics/hierarchy/:subjectId/:gradeId', TopicHierarchyController.getTopicHierarchy);
router.get('/coordinator/topics/sectionSubject/:subjectActivity/:subjectSubActivity', TopicHierarchyController.getTopicsByGrade);
router.post('/coordinator/topics/create', TopicHierarchyController.createTopic);
router.put('/coordinator/topics/update/:topicId', TopicHierarchyController.updateTopic);
router.delete('/coordinator/topics/delete/:topicId', TopicHierarchyController.deleteTopic);
router.get('/coordinator/topics/:topicId/materials', TopicHierarchyController.getTopicMaterials);
// router.post('/topics/materials/add', TopicHierarchyController.uploadTopicMaterials);
router.post(
  '/coordinator/topics/materials/upload',
  uploadMaterials.array('files', 10),  // frontend must use `files` as the field name
  TopicHierarchyController.uploadTopicMaterials
);
router.put('/coordinator/topics/materials/update/:materialId', TopicHierarchyController.updateTopicMaterial);
router.delete('/coordinator/topics/materials/delete/:materialId', TopicHierarchyController.deleteMaterial);
router.get('/coordinator/topics/materials/download/:filename', TopicHierarchyController.downloadFile);
router.get('/coordinator/topics/materials/view/:filename', TopicHierarchyController.viewFile);
router.get('/coordinator/topics/assessment-eligible/:studentRoll/:subjectId', TopicHierarchyController.getAssessmentEligibleTopics);
router.get('/coordinator/students/:studentRoll/progress/:subjectId', TopicHierarchyController.getStudentProgress);
router.post('/coordinator/students/progress/update', TopicHierarchyController.updateStudentProgress);
router.get('/coordinator/topics/getSectionSubjectActivities/:sectionId/:subjectId', TopicHierarchyController.getSectionSubjectActivitiesRecords);
router.get('/coordinator/topics/getSectionSubjectSubActivities/:activityId/:subjectId', TopicHierarchyController.getSectionSubjectSubActivitiesRecords);

// Enhanced Batch Management Routes
router.get('/coordinator/batches/:sectionId/:subjectId', BatchManagementController.getBatches);
router.post('/coordinator/batches/details', BatchManagementController.getBatchDetails);
router.post('/coordinator/batches/configure', BatchManagementController.configureBatches);
router.get('/coordinator/batches/:batchId/students', BatchManagementController.getBatchStudents);
router.post('/coordinator/batches/move-student', BatchManagementController.moveStudentToBatch);
router.get('/coordinator/batches/history/:studentRoll/:subjectId', BatchManagementController.getBatchHistory);
router.post('/coordinator/batches/reallocate', BatchManagementController.runBatchReallocation);
router.get('/coordinator/batches/analytics/:sectionId/:subjectId', BatchManagementController.getBatchAnalytics);
router.post('/coordinator/batches/initialize', BatchManagementController.initializeStudentBatches);
router.post('/coordinator/batches/update-size', BatchManagementController.updateBatchSize);
router.post('/coordinator/batches/getSectionSubjects', BatchManagementController.getSectionSubjects);

// Enhanced Schedule Management Routes

//WeeklySchedule
router.get('/coordinator/weekly-schedule/getWeeklySchedule', ScheduleManagementController.getWeeklySchedule);
router.post('/coordinator/weekly-schedule/addOrUpdateWeeklySchedule', ScheduleManagementController.addOrUpdateWeeklySchedule);
router.delete('/coordinator/weekly-schedule/deleteWeeklySchedule/:id', ScheduleManagementController.deleteWeeklySchedule);
router.post('/coordinator/weekly-schedule/subjects', ScheduleManagementController.getAllSubjects);
router.post('/coordinator/weekly-schedule/sections', ScheduleManagementController.getSectionsByGrade);
router.get('/coordinator/weekly-schedule/checkTimeConflict', ScheduleManagementController.checkTimeConflict);
router.get('/coordinator/enrollment/getVenuesByGrade', infraEnrollment.getVenuesByGrade);

router.post('/coordinator/schedule/create', ScheduleManagementController.createDailySchedule);
router.get('/coordinator/schedule/:date/:sectionId', ScheduleManagementController.getDailySchedule);
// router.get('/coordinator/schedule/weekly/:sectionId/:weekStart', ScheduleManagementController.getWeeklySchedule);
router.put('/coordinator/schedule/activity/:activityId', ScheduleManagementController.updateScheduleActivity);
router.patch('/coordinator/schedule/activity/:activityId/complete', ScheduleManagementController.markActivityCompleted);
router.get('/coordinator/schedule/mentors/available/:date/:startTime/:endTime/:subjectId/:gradeId', ScheduleManagementController.getAvailableMentors);
router.get('/coordinator/schedule/venues/available/:date/:startTime/:endTime/:subjectId/:gradeId', ScheduleManagementController.getAvailableVenues);
router.delete('/coordinator/schedule/:scheduleId', ScheduleManagementController.deleteSchedule);
router.post('/coordinator/schedule/:scheduleId/copy', ScheduleManagementController.copySchedule);

// Enhanced Academic Schedule Routes (Date-wise from Weekly Template)
router.get('/coordinator/academic-schedule/weekly-template/:gradeId', ScheduleManagementController.getWeeklyTemplate);
router.get('/coordinator/academic-schedule/monthly/:gradeId/:sectionId/:month/:year', ScheduleManagementController.getMonthlySchedule);
router.get('/coordinator/academic-schedule/monthly-alt/:gradeId/:month/:year', ScheduleManagementController.getMonthlyScheduleAlt);
router.get('/coordinator/academic-schedule/period-activities/:periodId/:date', ScheduleManagementController.getPeriodActivities);
router.get('/coordinator/academic-schedule/period-activities-alt/:periodId/:date', ScheduleManagementController.getPeriodActivitiesAlt);
router.post('/coordinator/academic-schedule/create-activity', ScheduleManagementController.createPeriodActivity);
router.post('/coordinator/academic-schedule/create-activity-split', ScheduleManagementController.createPeriodActivitySplit);
router.post('/coordinator/academic-schedule/create-time-based-activities', ScheduleManagementController.createTimeBasedActivitiesBatch);
router.put('/coordinator/academic-schedule/edit-period-activity/:activityId', ScheduleManagementController.updatePeriodActivity);
router.delete('/coordinator/academic-schedule/delete-period-activity/:activityId', ScheduleManagementController.deletePeriodActivity);
router.get('/coordinator/academic-schedule/batch-activities/:batchId/:date', ScheduleManagementController.getBatchActivities);
router.get('/coordinator/academic-schedule/batches/:sectionId/:subjectId', ScheduleManagementController.getSectionBatches);

// Student-Specific Schedule Management
router.post('/coordinator/schedule/getSectionStudents', ScheduleManagementController.getSectionStudents);
router.get('/coordinator/schedule/student/:date/:studentRoll', ScheduleManagementController.getStudentSchedule);
router.post('/coordinator/schedule/student/override', ScheduleManagementController.createOrUpdateStudentScheduleOverride);
router.delete('/coordinator/schedule/student/override/:id', ScheduleManagementController.deleteStudentScheduleOverride);
router.post('/coordinator/schedule/student/getSubjectActivity', ScheduleManagementController.getSubjectActivity);
router.post('/coordinator/schedule/student/getSectionSubjectSubActivities', ScheduleManagementController.getSectionSubjectSubActivities);
router.post('/coordinator/schedule/student/getTopicHierarchyBySubActivity', ScheduleManagementController.getTopicHierarchyBySubActivity);
router.post('/coordinator/schedule/student/getAllVenuesByTime', ScheduleManagementController.getAllVenuesByTime);

router.get('/coordinator/generate-schedule-template/:gradeId/:sectionId', ScheduleManagementController.generateScheduleTemplate);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/schedules/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueName = `schedule_${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const uploadScheduleSheet = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
router.post('/coordinator/schedule/process-schedule-sheet', uploadScheduleSheet.single('scheduleSheet'), ScheduleManagementController.processScheduleSheet);


// Manual schedule generation endpoints for testing
router.post('/coordinator/generate-student-wise-schedules-manual', ScheduleManagementController.generateStudentWiseSchedulesManual);
// router.post('/coordinator/run-daily-schedule-update-manual', coordinatorController.runDailyScheduleUpdateManual);

module.exports = router;
