const express = require('express');
const router = express.Router();
const { mentorStudents } = require('../controllers/mentorController');

router.post('/mentorStudents', mentorStudents);

module.exports = router;