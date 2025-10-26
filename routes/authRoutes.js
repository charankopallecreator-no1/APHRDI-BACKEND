const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController');

// Validation middleware for register
const validateRegister = [
	body('username').isLength({ min: 3 }).withMessage('username must be at least 3 chars'),
	body('email').isEmail().withMessage('valid email required'),
	body('password').isLength({ min: 6 }).withMessage('password must be at least 6 chars'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, errors: errors.array() });
		}
		next();
	}
];

// Validation middleware for login
const validateLogin = [
	body('email').isEmail().withMessage('valid email required'),
	body('password').exists().withMessage('password required'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, errors: errors.array() });
		}
		next();
	}
];

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

module.exports = router;