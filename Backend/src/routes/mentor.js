const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentor/mentorController');

router.post('/mentor/getMentorData', mentorController.getMentorData);
router.get('/mentor/getGrades', mentorController.getGrades);

//Profile
router.post('/mentor/getMentorAttendance', mentorController.getMentorAttendance);
router.post('/mentor/submitLeaveRequest', mentorController.submitLeaveRequest);
router.post('/mentor/getLeaveHistory', mentorController.getLeaveHistory);
router.post('/mentor/getMentorAssignments', mentorController.getMentorAssignments);
router.post('/mentor/getMentorSection', mentorController.getMentorSection);
router.post('/mentor/getMentorIssues', mentorController.getMentorIssues);

//Materials
router.post('/mentor/getGradeSubject', mentorController.getGradeSubject);
router.get('/mentor/getMaterials', mentorController.getMaterials);
router.put('/mentor/updateExpectedDate', mentorController.updateExpectedDate);

//Leave Approval
router.post('/mentor/getPendingLeaveRequests', mentorController.getPendingLeaveRequests);
router.post('/mentor/getLeaveRequestHistory', mentorController.getLeaveRequestHistory);
router.post('/mentor/updateLeaveRequestStatus', mentorController.updateLeaveRequestStatus);

module.exports = router;