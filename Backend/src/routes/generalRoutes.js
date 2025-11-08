const express = require('express');
const router = express.Router();
const generalController = require('../controllers/general/generalController');
const { authenticateToken } = require('../middleware/auth');

// General routes
router.post('/getUserRoles', authenticateToken, generalController.getUserRoles);
router.post('/getUserGeneralData', authenticateToken, generalController.getGeneralData);

router.get('/getGrades', authenticateToken, generalController.getGrades);
router.get('/getSections', authenticateToken, generalController.getSections);

module.exports = router;
