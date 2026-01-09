const { authenticate, requireAdmin, optionalAuth } = require('./auth.middleware');
const { 
  handleValidation,
  authValidation, 
  gameValidation, 
  messageValidation, 
  friendValidation,
  adminValidation,
} = require('./validation.middleware');

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
  handleValidation,
  authValidation,
  gameValidation,
  messageValidation,
  friendValidation,
  adminValidation,
};
