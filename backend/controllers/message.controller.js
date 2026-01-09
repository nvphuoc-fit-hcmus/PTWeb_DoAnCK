const { Message, Friendship } = require('../models');

/**
 * Gửi tin nhắn
 * POST /api/messages
 */
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    
    if (receiver_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Khong the gui tin nhan cho chinh minh',
      });
    }

    const message = await Message.send(req.user.id, receiver_id, content);

    res.status(201).json({
      success: true,
      message: 'Gui tin nhan thanh cong',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy hội thoại với một user
 * GET /api/messages/:userId
 */
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, before } = req.query;
    
    const messages = await Message.getConversation(req.user.id, userId, {
      limit: parseInt(limit),
      before,
    });

    // Mark messages as read
    await Message.markAsRead(userId, req.user.id);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy danh sách tất cả hội thoại
 * GET /api/messages
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.getConversations(req.user.id);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy số tin nhắn chưa đọc
 * GET /api/messages/unread/count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Xóa tin nhắn
 * DELETE /api/messages/:id
 */
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Message.delete(id, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay tin nhan hoac khong co quyen xoa',
      });
    }

    res.json({
      success: true,
      message: 'Da xoa tin nhan',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
  getUnreadCount,
  deleteMessage,
};
