const express = require('express');
const router = express.Router();
const generalController = require('../controllers/general/generalController');
const { authenticateToken } = require('../middleware/auth');
const getAcademicYear = require('../middleware/getAcademicYear');

router.use(authenticateToken);
router.use(getAcademicYear);

// General routes
router.get('/active-academic-year', generalController.getActiveAcademicYear);
router.post('/getUserRoles', generalController.getUserRoles);
router.post('/getUserGeneralData', generalController.getGeneralData);
router.get('/getGrades', generalController.getGrades);
router.get('/getSections', generalController.getSections);
router.post('/getCoordinatorGrades', generalController.getCoordinatorGrades);
router.post('/getGradeSections', generalController.getGradeSections);


module.exports = router;
