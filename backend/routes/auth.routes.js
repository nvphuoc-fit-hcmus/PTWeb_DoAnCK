const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticate, authValidation } = require('../middleware');

// Public routes
router.post('/register', authValidation.register, authController.register);
router.post('/login', authValidation.login, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/password', authenticate, authController.changePassword);

module.exports = router;
