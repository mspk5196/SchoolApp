const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');

router.get('/admin/adminCoordinators', adminController.adminCoordinators);
router.post('/admin/getAdminData', adminController.getAdminData);

module.exports = router;