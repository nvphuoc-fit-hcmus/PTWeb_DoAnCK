const express = require("express");
const { gameReviewController } = require("../controllers");
const { authenticate } = require("../middleware");

const router = express.Router();

// Lấy tất cả reviews của 1 game
router.get("/:gameId/reviews", gameReviewController.getGameReviews);

// Lấy thống kê rating của game
router.get("/:gameId/rating-stats", gameReviewController.getGameRatingStats);

// Lấy phân bố rating
router.get(
  "/:gameId/rating-distribution",
  gameReviewController.getRatingDistribution
);

// Tạo hoặc cập nhật review (cần đăng nhập)
router.post(
  "/:gameId/reviews",
  authenticate,
  gameReviewController.createOrUpdateReview
);

// Xóa review (cần đăng nhập)
router.delete(
  "/reviews/:reviewId",
  authenticate,
  gameReviewController.deleteReview
);

module.exports = router;
