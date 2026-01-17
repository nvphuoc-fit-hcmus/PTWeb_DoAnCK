const db = require("../database/db");

const GameReview = {
  tableName: "game_reviews",

  // Lấy tất cả reviews của 1 game
  async getGameReviews(gameId) {
    return db(this.tableName)
      .where("game_id", gameId)
      .join("users", "game_reviews.user_id", "users.id")
      .select(
        "game_reviews.id",
        "game_reviews.rating",
        "game_reviews.comment",
        "game_reviews.created_at",
        "users.id as user_id",
        "users.display_name",
        "users.username"
      )
      .orderBy("game_reviews.created_at", "desc");
  },

  // Lấy rating trung bình và số lượng reviews của 1 game
  async getGameRatingStats(gameId) {
    const stats = await db(this.tableName)
      .where("game_id", gameId)
      .avg("rating as average_rating")
      .count("* as review_count")
      .first();

    return {
      averageRating: stats.average_rating
        ? parseFloat(stats.average_rating).toFixed(1)
        : 0,
      reviewCount: stats.review_count || 0,
    };
  },

  // Lấy review của user cho game
  async getUserGameReview(gameId, userId) {
    return db(this.tableName)
      .where("game_id", gameId)
      .where("user_id", userId)
      .first();
  },

  // Tạo hoặc cập nhật review
  async createOrUpdateReview(gameId, userId, rating, comment) {
    const existing = await this.getUserGameReview(gameId, userId);

    if (existing) {
      // Update
      return db(this.tableName)
        .where("id", existing.id)
        .update({
          rating,
          comment,
          updated_at: new Date(),
        })
        .returning("*");
    } else {
      // Create
      return db(this.tableName)
        .insert({
          game_id: gameId,
          user_id: userId,
          rating,
          comment,
        })
        .returning("*");
    }
  },

  // Xóa review
  async deleteReview(reviewId) {
    return db(this.tableName).where("id", reviewId).delete();
  },

  // Lấy rating distribution của 1 game (ví dụ: bao nhiêu 5 sao, 4 sao, ...)
  async getRatingDistribution(gameId) {
    const distribution = await db(this.tableName)
      .where("game_id", gameId)
      .select("rating")
      .count("* as count")
      .groupBy("rating")
      .orderBy("rating", "desc");

    return distribution;
  },
};

module.exports = GameReview;
