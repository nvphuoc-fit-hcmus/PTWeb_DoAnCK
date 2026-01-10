const db = require("../database/db");

const Message = {
  tableName: "messages",

  async send(senderId, receiverId, content) {
    const [message] = await db(this.tableName)
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      })
      .returning("*");

    return message;
  },

  async getConversation(userId1, userId2, options = {}) {
    const { limit = 50, before } = options;

    let query = db(this.tableName)
      .where(function () {
        this.where({ sender_id: userId1, receiver_id: userId2 }).orWhere({
          sender_id: userId2,
          receiver_id: userId1,
        });
      })
      .orderBy("created_at", "desc")
      .limit(limit);

    if (before) {
      query = query.where("created_at", "<", before);
    }

    return query;
  },

  async getConversations(userId) {
    // Get all friends and their last message
    const conversations = await db.raw(
      `
      SELECT 
        f.id as friendship_id,
        CASE 
          WHEN f.requester_id = ? THEN f.addressee_id
          ELSE f.requester_id
        END as partner_id,
        u.username as partner_username,
        u.display_name as partner_display_name,
        u.avatar_config as partner_avatar,
        m.id as last_message_id,
        m.content as last_message,
        m.created_at as last_message_time
      FROM friendships f
      JOIN users u ON (
        (f.requester_id = ? AND u.id = f.addressee_id) OR
        (f.addressee_id = ? AND u.id = f.requester_id)
      )
      LEFT JOIN LATERAL (
        SELECT id, content, created_at
        FROM messages
        WHERE (sender_id = ? AND receiver_id = u.id) 
           OR (sender_id = u.id AND receiver_id = ?)
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      WHERE f.status = 'accepted'
        AND ((f.requester_id = ? AND f.addressee_id = u.id) 
          OR (f.addressee_id = ? AND f.requester_id = u.id))
      ORDER BY COALESCE(m.created_at, f.created_at) DESC
    `,
      [userId, userId, userId, userId, userId, userId, userId]
    );

    return conversations.rows.map((row) => ({
      id: row.partnership_id,
      conversation_partner: row.partner_id,
      partner_username: row.partner_username,
      partner_display_name: row.partner_display_name,
      partner_avatar: row.partner_avatar,
      last_message: row.last_message,
    }));
  },

  async markAsRead(senderId, receiverId) {
    return db(this.tableName)
      .where({ sender_id: senderId, receiver_id: receiverId, is_read: false })
      .update({ is_read: true, read_at: db.fn.now() });
  },

  async getUnreadCount(userId) {
    const [{ count }] = await db(this.tableName)
      .where({ receiver_id: userId, is_read: false })
      .count();

    return parseInt(count);
  },

  async delete(id, userId) {
    return db(this.tableName).where({ id, sender_id: userId }).del();
  },
};

module.exports = Message;
