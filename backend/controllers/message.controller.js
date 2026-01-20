const { Message, Friendship } = require("../models");

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;

    if (receiver_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Không thể gửi tin nhắn cho chính mình",
      });
    }

    const message = await Message.send(req.user.id, receiver_id, content);

    res.status(201).json({
      success: true,
      message: "Gửi tin nhắn thành công",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

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
    console.error("Get conversation error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const conversations = await Message.getConversations(
      req.user.id,
      page,
      limit,
    );

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Message.delete(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tin nhắn hoặc không có quyền xóa",
      });
    }

    res.json({
      success: true,
      message: "Đã xóa tin nhắn",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
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
