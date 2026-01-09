const express = require('express');
const router = express.Router();
const { achievementController } = require('../controllers');
const { authenticate } = require('../middleware');

// Public routes
router.get('/', achievementController.getAllAchievements);

// Protected routes
router.get('/me', authenticate, achievementController.getMyAchievements);
router.get('/user/:userId', achievementController.getUserAchievements);

module.exports = router;
