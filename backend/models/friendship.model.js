const db = require('../database/db');

const Friendship = {
  tableName: 'friendships',

  // Find friendship between two users
  async findBetween(userId1, userId2) {
    return db(this.tableName)
      .where(function() {
        this.where({ requester_id: userId1, addressee_id: userId2 })
          .orWhere({ requester_id: userId2, addressee_id: userId1 });
      })
      .first();
  },

  // Send friend request
  async sendRequest(requesterId, addresseeId) {
    // Check if friendship already exists
    const existing = await this.findBetween(requesterId, addresseeId);
    if (existing) {
      return { error: 'Friendship already exists', existing };
    }

    const [friendship] = await db(this.tableName)
      .insert({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: 'pending',
      })
      .returning('*');
    
    return friendship;
  },

  // Accept friend request
  async acceptRequest(requesterId, addresseeId) {
    const [friendship] = await db(this.tableName)
      .where({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' })
      .update({ status: 'accepted', updated_at: db.fn.now() })
      .returning('*');
    
    return friendship;
  },

  // Reject friend request
  async rejectRequest(requesterId, addresseeId) {
    const [friendship] = await db(this.tableName)
      .where({ requester_id: requesterId, addressee_id: addresseeId, status: 'pending' })
      .update({ status: 'rejected', updated_at: db.fn.now() })
      .returning('*');
    
    return friendship;
  },

  // Get pending requests for user
  async getPendingRequests(userId) {
    return db(this.tableName)
      .join('users', 'friendships.requester_id', 'users.id')
      .where({ addressee_id: userId, status: 'pending' })
      .select(
        'friendships.id',
        'friendships.requester_id',
        'friendships.created_at',
        'users.username',
        'users.display_name',
        'users.avatar_config'
      );
  },

  // Get friends list
  async getFriends(userId) {
    const friends = await db(this.tableName)
      .where(function() {
        this.where({ requester_id: userId, status: 'accepted' })
          .orWhere({ addressee_id: userId, status: 'accepted' });
      })
      .select('requester_id', 'addressee_id');

    // Get friend user IDs
    const friendIds = friends.map(f => 
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );

    if (friendIds.length === 0) return [];

    return db('users')
      .whereIn('id', friendIds)
      .select('id', 'username', 'display_name', 'avatar_config', 'last_login');
  },

  // Unfriend
  async unfriend(userId1, userId2) {
    return db(this.tableName)
      .where(function() {
        this.where({ requester_id: userId1, addressee_id: userId2 })
          .orWhere({ requester_id: userId2, addressee_id: userId1 });
      })
      .del();
  },

  // Check if users are friends
  async areFriends(userId1, userId2) {
    const friendship = await this.findBetween(userId1, userId2);
    return friendship && friendship.status === 'accepted';
  },
};

module.exports = Friendship;
