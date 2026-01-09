const express = require('express');
const router = express.Router();
const { messageController } = require('../controllers');
const { authenticate, messageValidation } = require('../middleware');

// All routes require authentication
router.use(authenticate);

router.get('/', messageController.getConversations);
router.get('/unread/count', messageController.getUnreadCount);
router.post('/', messageValidation.send, messageController.sendMessage);
router.get('/:userId', messageValidation.getConversation, messageController.getConversation);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
