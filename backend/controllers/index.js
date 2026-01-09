// Export all controllers
const authController = require('./auth.controller');
const userController = require('./user.controller');
const gameController = require('./game.controller');
const friendController = require('./friend.controller');
const messageController = require('./message.controller');
const achievementController = require('./achievement.controller');
const adminController = require('./admin.controller');

module.exports = {
  authController,
  userController,
  gameController,
  friendController,
  messageController,
  achievementController,
  adminController,
};
