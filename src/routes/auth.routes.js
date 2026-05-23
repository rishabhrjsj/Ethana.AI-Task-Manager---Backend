const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { signupValidation, loginValidation } = require('../validations/auth.validation');

const router = express.Router();

router.post('/signup', signupValidation, validate, authController.signup);
router.post('/login', loginValidation, validate, authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
