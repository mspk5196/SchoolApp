const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');
const materialController = require('../controllers/mentor/mentorMaterialController');
const { authenticateToken } = require('../middleware/auth');
const getAcademicYear = require('../middleware/getAcademicYear');

router.use(authenticateToken);
router.use(getAcademicYear);

// Schedule routes
router.post('/getMentorSchedule', mentorController.getMentorSchedule);
router.post('/getSessionDetails', mentorController.getSessionDetails);

// Session management routes
router.post('/startSession', mentorController.startSession);
router.post('/getStudentsForSession', mentorController.getStudentsForSession);
router.post('/finishSession', mentorController.finishSession);
router.post('/updateFinishedSessionEvaluations', mentorController.updateFinishedSessionEvaluations);
router.post('/endSession', mentorController.endSession);

// Homework routes
router.post('/getActivitiesForHomework', mentorController.getActivitiesForHomework);
router.post('/getTopicsForHomework', mentorController.getTopicsForHomework);

// Mentor material routes (read-only, reuse coordinator logic)
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

router.post('/getSectionSubjects',  materialController.getSectionSubjects);

module.exports = router;