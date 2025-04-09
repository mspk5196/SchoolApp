const express = require('express');
const router = express.Router();
const { adminCoordinators } = require('../controllers/adminController');

router.get('/adminCoordinators', adminCoordinators);

module.exports = router;