const express = require('express');
const router = express.Router();
const { adminCoordinators } = require('../controllers/admin/adminController');

router.get('/adminCoordinators', adminCoordinators);

module.exports = router;