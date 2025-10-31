const express = require('express');
const router = express.Router();
const { translate } = require('../controllers/translationController');
const { protect } = require('../middleware/auth');

// router.post('/translate', protect, translate);

module.exports = router;