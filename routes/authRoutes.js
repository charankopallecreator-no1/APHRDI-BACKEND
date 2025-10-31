const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController');

// ✅ Middleware to handle validation results cleanly
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// ✅ Registration validation
const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  handleValidation,
];

// ✅ Login validation
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidation,
];

// ✅ Routes
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    await register(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    await login(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
