const User = require('../models/User');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createModule = async (req, res) => {
  try {
    const module = await Module.create(req.body);
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};