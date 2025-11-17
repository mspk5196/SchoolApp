const express = require('express');
const router = express.Router();
const multer = require('multer');
const enrollmentController = require('../controllers/coordinator/enrollmentController');
const coordinatorController = require('../controllers/coordinator/coordinatorController');
const subjectAllotmentController = require('../controllers/coordinator/subjectAllotmentController');
const materialController = require('../controllers/coordinator/materialController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Section management routes
router.post('/enrollment/getSectionsByGrade', authenticateToken, enrollmentController.getSectionsByGrade);
router.post('/enrollment/createSection', authenticateToken, enrollmentController.createSection);
router.post('/enrollment/deleteSection', authenticateToken, enrollmentController.deleteSection);

// Student enrollment routes
router.post('/enrollment/enrollStudent', authenticateToken, enrollmentController.enrollStudent);
router.get('/enrollment/generate-student-enroll-template', authenticateToken, enrollmentController.generateStudentEnrollTemplate);
router.post('/enrollment/bulk-upload-students', authenticateToken, upload.single('file'), enrollmentController.bulkUploadStudents);

// Mentor assignment routes
router.post('/getSectionsWithMentors', authenticateToken, coordinatorController.getSectionsWithMentors);
router.get('/getUnassignedMentors', authenticateToken, coordinatorController.getUnassignedMentors);
router.post('/assignMentorToSection', authenticateToken, coordinatorController.assignMentorToSection);
router.post('/unassignMentorFromSection', authenticateToken, coordinatorController.unassignMentorFromSection);
router.post('/getStudentsBySection', authenticateToken, coordinatorController.getStudentsBySection);

// Subject-mentor mapping routes
router.post('/mentor/getMentorGradeSubject', authenticateToken, coordinatorController.getMentorGradeSubject);
router.post('/mentor/getSubjectGradeMentors', authenticateToken, coordinatorController.getSubjectGradeMentors);
router.post('/mentor/getEnroledSubjectMentors', authenticateToken, coordinatorController.getEnroledSubjectMentors);
router.post('/mentor/assignMentorToSubject', authenticateToken, coordinatorController.assignMentorToSubject);
router.post('/mentor/removeEnroledSubjectMentor', authenticateToken, coordinatorController.removeEnroledSubjectMentor);

// Subject allotment routes
router.post('/getGradeSections', authenticateToken, subjectAllotmentController.getGradeSections);
router.get('/getSubjects', authenticateToken, subjectAllotmentController.getSubjects);
router.get('/getActivities', authenticateToken, subjectAllotmentController.getActivities);
router.get('/getSubActivities', authenticateToken, subjectAllotmentController.getSubActivities);
router.post('/getSubjectActivities', authenticateToken, subjectAllotmentController.getSubjectActivities);
router.post('/addSubjectToSection', authenticateToken, subjectAllotmentController.addSubjectToSection);
router.post('/removeSubject', authenticateToken, subjectAllotmentController.removeSubject);
router.post('/addSubjectActivity', authenticateToken, subjectAllotmentController.addSubjectActivity);
router.post('/removeSubjectActivity', authenticateToken, subjectAllotmentController.removeSubjectActivity);
router.post('/addSubjectSubActivity', authenticateToken, subjectAllotmentController.addSubjectSubActivity);
router.post('/removeSubjectSubActivity', authenticateToken, subjectAllotmentController.removeSubjectSubActivity);
router.post('/addSubjects', authenticateToken, subjectAllotmentController.addSubjects);
router.post('/addActivities', authenticateToken, subjectAllotmentController.addActivities);
router.post('/addSubActivities', authenticateToken, subjectAllotmentController.addSubActivities);

// Batch management routes
router.post('/batch/getBatches', authenticateToken, materialController.getBatches);
router.post('/batch/getBatchAnalytics', authenticateToken, materialController.getBatchAnalytics);
router.post('/batch/initializeBatches', authenticateToken, materialController.initializeBatches);
router.post('/batch/reallocateBatches', authenticateToken, materialController.reallocateBatches);
router.post('/batch/updateBatchSize', authenticateToken, materialController.updateBatchSize);
router.post('/batch/getBatchDetails', authenticateToken, materialController.getBatchDetails);
router.post('/batch/moveStudentBatch', authenticateToken, materialController.moveStudentBatch);
router.post('/batch/getBatchStudents', authenticateToken, materialController.getBatchStudents);
router.post('/batch/moveMultipleStudents', authenticateToken, materialController.moveMultipleStudents);
// New: configure batches (create batch records without assigning students)
router.post('/batches/configure', authenticateToken, materialController.configureBatches);
// Assign students to batches (manual assignment)
router.post('/batch/assignStudents', authenticateToken, materialController.assignStudents);

// Topic hierarchy routes
router.post('/topic/getTopicHierarchy', authenticateToken, materialController.getTopicHierarchy);
router.post('/topic/createTopic', authenticateToken, materialController.createTopic);
router.post('/topic/updateTopic', authenticateToken, materialController.updateTopic);
router.post('/topic/deleteTopic', authenticateToken, materialController.deleteTopic);
router.post('/topic/getActivitiesForSubject', authenticateToken, materialController.getActivitiesForSubject);
router.post('/topic/getSubActivitiesForActivity', authenticateToken, materialController.getSubActivitiesForActivity);

// Material management routes
router.post('/material/getTopicMaterials', authenticateToken, materialController.getTopicMaterials);
router.post('/material/addTopicMaterial', authenticateToken, materialController.addTopicMaterial);
router.post('/material/updateTopicMaterial', authenticateToken, materialController.updateTopicMaterial);
router.post('/material/deleteTopicMaterial', authenticateToken, materialController.deleteTopicMaterial);
router.post('/material/setExpectedCompletionDate', authenticateToken, materialController.setExpectedCompletionDate);

// Excel upload routes
router.get('/batch/generate-batch-template', authenticateToken, materialController.generateBatchTemplate);
router.post('/batch/upload-batches', authenticateToken, upload.single('file'), materialController.uploadBatchesFromExcel);
router.get('/material/generate-materials-template', authenticateToken, materialController.generateMaterialsTemplate);
router.post('/material/upload-materials', authenticateToken, upload.single('file'), materialController.uploadMaterialsFromExcel);

// Utility routes
router.post('/getGradeSubject', authenticateToken, materialController.getGradeSubjects);

module.exports = router;

