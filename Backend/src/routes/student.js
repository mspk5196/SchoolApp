const express = require('express');
const router = express.Router();
const { getStudentData, getStudentDetails } = require('../controllers/studentController');

router.post('/getStudentData', getStudentData);
router.post('/studentDetails', getStudentDetails);

module.exports = router;