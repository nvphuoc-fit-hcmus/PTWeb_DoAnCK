const { GameReview } = require("../models");

const gameReviewController = {
  async getGameReviews(req, res) {
    try {
      const { gameId } = req.params;
      const reviews = await GameReview.getGameReviews(gameId);
      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error("Error getting game reviews:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy đánh giá game",
      });
    }
  },

  async getGameRatingStats(req, res) {
    try {
      const { gameId } = req.params;
      const stats = await GameReview.getGameRatingStats(gameId);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting rating stats:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê rating",
      });
    }
  },

  async createOrUpdateReview(req, res) {
    try {
      const { gameId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Cần đăng nhập để đánh giá game",
        });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating phải là số từ 1 đến 5",
        });
      }

      const result = await GameReview.createOrUpdateReview(
        gameId,
        userId,
        rating,
        comment || null
      );

      res.json({
        success: true,
        message: "Đánh giá game thành công",
        data: result,
      });
    } catch (error) {
      console.error("Error creating/updating review:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi đánh giá game",
      });
    }
  },

  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user?.id;

      const review = await require("../database/db")("game_reviews")
        .where("id", reviewId)
        .first();

      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đánh giá",
        });
      }

      if (review.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xóa đánh giá này",
        });
      }

      await GameReview.deleteReview(reviewId);

      res.json({
        success: true,
        message: "Xóa đánh giá thành công",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa đánh giá",
      });
    }
  },

  async getRatingDistribution(req, res) {
    try {
      const { gameId } = req.params;
      const distribution = await GameReview.getRatingDistribution(gameId);
      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      console.error("Error getting rating distribution:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy phân bố rating",
      });
    }
  },
};

module.exports = gameReviewController;
