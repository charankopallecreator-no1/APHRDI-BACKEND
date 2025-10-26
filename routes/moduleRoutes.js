const express = require('express');
const router = express.Router();
const { getModules, getModule, createModule } = require('../controllers/moduleController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getModules);
router.get('/:id', protect, getModule);
router.post('/', protect, createModule);

module.exports = router;