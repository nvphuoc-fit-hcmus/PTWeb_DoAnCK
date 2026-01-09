const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { authenticate, requireAdmin, adminValidation } = require('../middleware');

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Dashboard stats
router.get('/stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminValidation.updateUser, adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Game management
router.get('/games', adminController.getGames);
router.put('/games/:id', adminValidation.updateGame, adminController.updateGame);

// Achievement management
router.post('/achievements', adminController.createAchievement);
router.put('/achievements/:id', adminController.updateAchievement);
router.delete('/achievements/:id', adminController.deleteAchievement);

module.exports = router;
