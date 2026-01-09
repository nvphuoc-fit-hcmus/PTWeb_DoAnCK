const db = require('../database/db');

const Message = {
  tableName: 'messages',

  // Send message
  async send(senderId, receiverId, content) {
    const [message] = await db(this.tableName)
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      })
      .returning('*');
    
    return message;
  },

  // Get conversation between two users
  async getConversation(userId1, userId2, options = {}) {
    const { limit = 50, before } = options;
    
    let query = db(this.tableName)
      .where(function() {
        this.where({ sender_id: userId1, receiver_id: userId2 })
          .orWhere({ sender_id: userId2, receiver_id: userId1 });
      })
      .orderBy('created_at', 'desc')
      .limit(limit);
    
    if (before) {
      query = query.where('created_at', '<', before);
    }
    
    return query;
  },

  // Get all conversations for user (latest message per conversation)
  async getConversations(userId) {
    const messages = await db.raw(`
      SELECT DISTINCT ON (conversation_partner)
        m.*,
        u.username as partner_username,
        u.display_name as partner_display_name,
        u.avatar_config as partner_avatar
      FROM (
        SELECT *,
          CASE 
            WHEN sender_id = ? THEN receiver_id
            ELSE sender_id
          END as conversation_partner
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
      ) m
      JOIN users u ON u.id = m.conversation_partner
      ORDER BY conversation_partner, m.created_at DESC
    `, [userId, userId, userId]);
    
    return messages.rows;
  },

  // Mark messages as read
  async markAsRead(senderId, receiverId) {
    return db(this.tableName)
      .where({ sender_id: senderId, receiver_id: receiverId, is_read: false })
      .update({ is_read: true, read_at: db.fn.now() });
  },

  // Get unread count
  async getUnreadCount(userId) {
    const [{ count }] = await db(this.tableName)
      .where({ receiver_id: userId, is_read: false })
      .count();
    
    return parseInt(count);
  },

  // Delete message
  async delete(id, userId) {
    return db(this.tableName)
      .where({ id, sender_id: userId })
      .del();
  },
};

module.exports = Message;
