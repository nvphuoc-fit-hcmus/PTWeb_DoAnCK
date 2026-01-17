import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { gameAPI } from "../../services/api";
import "./GameReview.css";

const GameReview = ({ gameId, gameName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [gameId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await gameAPI.getGameReviews(gameId);
      setReviews(res.data.data || []);

      if (user) {
        const myReview = res.data.data?.find((r) => r.user_id === user.id);
        if (myReview) {
          setUserReview(myReview);
          setRating(myReview.rating);
          setComment(myReview.comment || "");
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await gameAPI.getGameRatingStats(gameId);
      setStats(res.data.data || { averageRating: 0, reviewCount: 0 });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá game");
      return;
    }

    try {
      setIsSubmitting(true);
      await gameAPI.submitReview(gameId, rating, comment);
      alert(
        userReview
          ? "Cập nhật đánh giá thành công!"
          : "Đánh giá game thành công!"
      );
      setShowReviewForm(false);
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Lỗi khi đánh giá game");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await gameAPI.deleteReview(reviewId);
      alert("Xóa đánh giá thành công!");
      setUserReview(null);
      setRating(5);
      setComment("");
      fetchReviews();
      fetchStats();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Lỗi khi xóa đánh giá");
    }
  };

  const renderStars = (value, onChange = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= value ? "filled" : ""}`}
            onClick={() => onChange && onChange(star)}
            style={{ cursor: onChange ? "pointer" : "default" }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="game-review">
      <div className="review-stats">
        <div className="average-rating">
          <div className="big-rating">{stats.averageRating}</div>
          {renderStars(Math.round(stats.averageRating))}
          <div className="review-count">({stats.reviewCount} đánh giá)</div>
        </div>
      </div>

      {user && (
        <div className="review-form-section">
          {!showReviewForm ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowReviewForm(true)}
            >
              {userReview ? "✏️ Chỉnh sửa đánh giá" : "⭐ Đánh giá game"}
            </button>
          ) : (
            <div className="review-form">
              <h3>
                {userReview ? "Chỉnh sửa đánh giá" : "Đánh giá " + gameName}
              </h3>

              <div className="form-group">
                <label>Rating:</label>
                {renderStars(rating, setRating)}
              </div>

              <div className="form-group">
                <label htmlFor="comment">Bình luận (không bắt buộc):</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về game này..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang lưu..." : "Gửi đánh giá"}
                </button>
                {userReview && (
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteReview(userReview.id)}
                  >
                    Xóa đánh giá
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReviewForm(false)}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="login-prompt">
          <p>Vui lòng đăng nhập để đánh giá game</p>
        </div>
      )}

      <div className="reviews-list">
        <h3>📝 Đánh giá từ cộng đồng ({reviews.length})</h3>

        {isLoading ? (
          <p className="loading">Đang tải đánh giá...</p>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">Chưa có đánh giá nào</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.display_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="reviewer-name">{review.display_name}</div>
                    <div className="reviewer-username">@{review.username}</div>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
              <div className="review-date">
                {new Date(review.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameReview;
