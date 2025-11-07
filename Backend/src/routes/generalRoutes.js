const express = require('express');
const router = express.Router();
const generalController = require('../controllers/general/generalController');
const { authenticateToken } = require('../middleware/auth');

// General routes
router.post('/getUserRoles', authenticateToken, generalController.getUserRoles);
router.post('/getUserGeneralData', authenticateToken, generalController.getGeneralData);

module.exports = router;
