const db = require("../database/db");

const Friendship = {
  tableName: "friendships",

  async findBetween(userId1, userId2) {
    return db(this.tableName)
      .where(function () {
        this.where({ requester_id: userId1, addressee_id: userId2 }).orWhere({
          requester_id: userId2,
          addressee_id: userId1,
        });
      })
      .first();
  },

  async sendRequest(requesterId, addresseeId) {
    const existing = await this.findBetween(requesterId, addresseeId);
    if (existing) {
      return { error: "Friendship already exists", existing };
    }

    const [friendship] = await db(this.tableName)
      .insert({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: "pending",
      })
      .returning("*");

    return friendship;
  },

  async acceptRequest(requesterId, addresseeId) {
    const [friendship] = await db(this.tableName)
      .where({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: "pending",
      })
      .update({ status: "accepted", updated_at: db.fn.now() })
      .returning("*");

    return friendship;
  },

  async rejectRequest(requesterId, addresseeId) {
    const [friendship] = await db(this.tableName)
      .where({
        requester_id: requesterId,
        addressee_id: addresseeId,
        status: "pending",
      })
      .update({ status: "rejected", updated_at: db.fn.now() })
      .returning("*");

    return friendship;
  },

  async getPendingRequests(userId) {
    return db(this.tableName)
      .join("users", "friendships.requester_id", "users.id")
      .where({ addressee_id: userId, status: "pending" })
      .select(
        "friendships.id",
        "friendships.requester_id",
        "friendships.created_at",
        "users.username",
        "users.display_name",
        "users.avatar_config"
      );
  },

  async getFriends(userId, page = 1, limit = 10) {
    const { paginate } = require("../utils/pagination.helper");
    
    // Get friend IDs
    const friends = await db(this.tableName)
      .where(function () {
        this.where({ requester_id: userId, status: "accepted" }).orWhere({
          addressee_id: userId,
          status: "accepted",
        });
      })
      .select("requester_id", "addressee_id");

    const friendIds = friends.map((f) =>
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );

    if (friendIds.length === 0) {
      return {
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // Get paginated users
    const query = db("users")
      .whereIn("id", friendIds)
      .select("id", "username", "display_name", "avatar_config", "last_login")
      .orderBy("username", "asc");

    return paginate(query, page, limit);
  },

  async unfriend(userId1, userId2) {
    return db(this.tableName)
      .where(function () {
        this.where({ requester_id: userId1, addressee_id: userId2 }).orWhere({
          requester_id: userId2,
          addressee_id: userId1,
        });
      })
      .del();
  },

  async areFriends(userId1, userId2) {
    const friendship = await this.findBetween(userId1, userId2);
    return friendship && friendship.status === "accepted";
  },
};

module.exports = Friendship;
