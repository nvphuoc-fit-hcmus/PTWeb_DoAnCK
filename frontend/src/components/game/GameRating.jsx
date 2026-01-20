import { useState } from 'react';
import './GameRating.css';

const GameRating = ({ gameId, gameName, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment });
      onClose();
    } catch (error) {
      console.error('Submit rating error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi gửi đánh giá';
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-overlay">
      <div className="rating-modal">
        <h2>Đánh giá {gameName}</h2>
        
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </button>
          ))}
        </div>
        
        <p className="rating-text">
          {rating > 0 ? `${rating} sao` : 'Chọn số sao'}
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            className="rating-comment"
            placeholder="Nhận xét của bạn về game này... (không bắt buộc)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />

          <div className="rating-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Bỏ qua
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameRating;
