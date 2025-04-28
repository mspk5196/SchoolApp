const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');

router.post('/mentor/getMentorData', mentorController.getMentorData);
router.get('/mentor/getGrades', mentorController.getGrades);

//Materials
router.post('/mentor/getGradeSubject', mentorController.getGradeSubject);
router.get('/mentor/getMaterials', mentorController.getMaterials);
router.put('/mentor/updateExpectedDate', mentorController.updateExpectedDate);

module.exports = router;