const express = require('express');
const router = express.Router();
const { getCoordinatorData, coordinatorMentors, coordinatorStudents } = require('../controllers/coordinatorController');

router.post('/getCoordinatorData', getCoordinatorData);
router.post('/coordinatorMentors', coordinatorMentors);
router.post('/coordinatorStudents', coordinatorStudents);

module.exports = router;