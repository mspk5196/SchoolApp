const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinator/coordinatorController');
const infraEnrollment = require('../controllers/coordinator/infrastructreEnrollment')
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
router.post('/coordinator/coordinatorMentors', coordinatorController.coordinatorMentors);
router.post('/coordinator/coordinatorStudents', coordinatorController.coordinatorStudents);

//Profile
router.post('/coordinator/getAttendance', coordinatorController.getAttendance);
router.post('/coordinator/submitLeaveRequest', coordinatorController.submitLeaveRequest);
router.post('/coordinator/getLeaveHistory', coordinatorController.getLeaveHistory);
router.post('/coordinator/getMentorAssignments', coordinatorController.getCoordinatorAssignments);
router.post('/coordinator/getMentorSection', coordinatorController.getCoordinatorSection);
router.post('/coordinator/getMentorIssues', coordinatorController.getCoordinatorIssues);

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

//StudentEnrollment
router.get('/coordinator/getGrades', coordinatorController.getGrades);
router.post(
  '/coordinator/enrollStudent',
  uploadStudentProfile.single('profilePhoto'), // matches FormData key
  coordinatorController.enrollStudent
);
router.post(
  '/coordinator/enrollMentor',
  uploadMentorProfile.single('profilePhoto'), // matches FormData key
  coordinatorController.enrollMentor
);

// Create/update academic schedule
router.post('/coordinator/academic-schedule/schedule-add', coordinatorController.createOrUpdateSchedule);
router.get('/coordinator/academic-schedule/getShedule/:section_id/:day', coordinatorController.getSchedule);
router.post('/coordinator/academic-schedule/sections', coordinatorController.getSectionsByGrade);
router.get('/coordinator/academic-schedule/subjects', coordinatorController.getAllSubjects);

//ExamSchedule
router.get('/coordinator/getExamSchedule', coordinatorController.getExamSchedule);
router.post('/coordinator/createExamSchedule', coordinatorController.createExamSchedule);
router.post('/coordinator/updateExamSchedule', coordinatorController.updateExamSchedule);
router.post('/coordinator/deleteExamSchedule', coordinatorController.deleteExamSchedule);
//WeeklySchedule
router.get('/coordinator/weekly-schedule/getWeeklySchedule', coordinatorController.getWeeklySchedule);
router.post('/coordinator/weekly-schedule/addOrUpdateWeeklySchedule', coordinatorController.addOrUpdateWeeklySchedule);
router.delete('/coordinator/weekly-schedule/deleteWeeklySchedule/:id', coordinatorController.deleteWeeklySchedule);
router.get('/coordinator/weekly-schedule/getAvailableMentors', coordinatorController.getAvailableMentors);
// Invigilation duties
router.get('/coordinator/getExamScheduleWithInvigilators', coordinatorController.getExamScheduleWithInvigilators);
router.post('/coordinator/assignInvigilators', coordinatorController.assignInvigilators);
router.get('/coordinator/getAvailableMentorsForInvigilation', coordinatorController.getAvailableMentorsForInvigilation);

//StudentsPage
router.post('/coordinator/student/getSectionStudents', coordinatorController.getSectionStudents);

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

//Events
router.post('/coordinator/events/create', uploadEventBanner.single('bannerPhoto'),coordinatorController.createEvent);
router.get('/coordinator/events/get', coordinatorController.getEvents);
router.delete('/coordinator/events/delete', coordinatorController.deleteEvent);

//Calendar Page
router.get('/coordinator/calendar/events', coordinatorController.getCalendarEvents);
router.post('/coordinator/calendar/events', coordinatorController.addCalendarEvent);
router.delete('/coordinator/calendar/events', coordinatorController.deleteCalendarEvent);


module.exports = router;
