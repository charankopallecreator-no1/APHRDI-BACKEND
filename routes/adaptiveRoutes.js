const express = require('express');
const router = express.Router();
const { getRecommendedModules } = require('../controllers/adaptiveController');
const { protect } = require('../middleware/auth');

router.get('/recommendations', protect, getRecommendedModules);

module.exports = router;