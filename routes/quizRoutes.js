const express = require('express');
const router = express.Router();
const { getQuizByModule, submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.get('/module/:moduleId', protect, getQuizByModule);
router.post('/:quizId/submit', protect, submitQuiz);

module.exports = router;