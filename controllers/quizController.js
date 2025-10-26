const Quiz = require('../models/Quiz');
const QuizResponse = require('../models/QuizResponse');

exports.getQuizByModule = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ moduleId: req.params.moduleId });
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }
    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const isCorrect = quiz.questions[index].correctAnswer === answer;
      if (isCorrect) score++;
      return { questionIndex: index, selectedAnswer: answer, isCorrect };
    });

    const quizResponse = await QuizResponse.create({
      userId: req.user.id,
      quizId: quiz._id,
      answers: gradedAnswers,
      score: (score / quiz.questions.length) * 100
    });

    res.status(201).json({ success: true, data: quizResponse });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};