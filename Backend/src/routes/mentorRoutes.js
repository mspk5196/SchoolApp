const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');
const mentorMaterialController = require('../controllers/mentor/mentorMaterialController');
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
router.post('/material/getSectionSubjects', mentorMaterialController.getSectionSubjects);
router.post('/material/getTopicMaterials', mentorMaterialController.getTopicMaterials);
router.post('/material/getBatches', mentorMaterialController.getBatches);
router.post('/material/getBatchAnalytics', mentorMaterialController.getBatchAnalytics);

router.post('/topic/getTopicHierarchy', mentorMaterialController.getTopicHierarchy);
router.post('/topic/getActivitiesForSubject', mentorMaterialController.getActivitiesForSubject);
router.post('/topic/getSubActivitiesForActivity', mentorMaterialController.getSubActivitiesForActivity);

module.exports = router;