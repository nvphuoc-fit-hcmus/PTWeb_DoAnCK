const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { authenticate } = require('../middleware');

// Protected routes
router.get('/search', authenticate, userController.searchUsers);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/:id', authenticate, userController.getProfile);

module.exports = router;
