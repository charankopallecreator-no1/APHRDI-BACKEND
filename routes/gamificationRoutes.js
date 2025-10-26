const express = require('express');
const router = express.Router();
const { updatePoints } = require('../controllers/gamificationController');
const { protect } = require('../middleware/auth');

router.post('/points', protect, updatePoints);

module.exports = router;