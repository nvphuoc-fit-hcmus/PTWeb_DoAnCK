import { useState } from "react";
import "./GameInstructions.css";

const GameInstructions = ({ gameSlug }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const instructions = {
    "caro-5": {
      title: "Hướng dẫn Caro 5 hàng",
      icon: "⭕",
      rules: [
        "Mục tiêu: Xếp 5 quân cùng loại thành một hàng liên tiếp (ngang, dọc hoặc chéo) để thắng",
        "Bàn cờ: 15×15 ô",
        "Cách chơi: Lần lượt nhấn chuột vào các ô trống để đặt quân X hoặc O",
        "Người chơi thứ nhất: X (màu đỏ)",
        "Người chơi thứ hai: O (màu xanh)",
        "Lưu ý: Không thể đặt quân lên ô đã có quân khác",
      ],
      tips: [
        "Tập trung vào việc hình thành các 'dây 4' (chuỗi 4 quân có thể tạo thành 5 quân)",
        "Cản bước đi của đối thủ bằng cách chặn các dây 4 của họ",
        "Nên chơi ở giữa bàn cờ để có nhiều cơ hội phát triển",
      ],
    },
    "caro-4": {
      title: "Hướng dẫn Caro 4 hàng",
      icon: "🔴",
      rules: [
        "Mục tiêu: Xếp 4 quân cùng loại thành một hàng liên tiếp để thắng",
        "Bàn cờ: 10×10 ô",
        "Cách chơi: Nhấn chuột vào các ô trống để đặt quân của bạn",
        "Người chơi thứ nhất: X (màu đỏ)",
        "Người chơi thứ hai: O (màu xanh)",
        "Hòa: Khi bàn cờ đầy mà không ai có 4 quân liên tiếp",
      ],
      tips: [
        "Tạo hai 'đe dọa' cùng lúc để đối thủ không thể chặn cả hai",
        "Phòng thủ tích cực bằng cách cắt đứt các chuỗi của đối thủ",
        "Kiểm soát các ô giữa bàn cờ - đây là vị trí chiến lược",
      ],
    },
    "tic-tac-toe": {
      title: "Hướng dẫn Tic-Tac-Toe",
      icon: "❌",
      rules: [
        "Mục tiêu: Xếp 3 quân cùng loại thành một hàng liên tiếp để thắng",
        "Bàn cờ: 3×3 ô",
        "Cách chơi: Lần lượt nhấn chuột vào các ô trống để đặt quân",
        "Người chơi thứ nhất: X (màu đỏ)",
        "Người chơi thứ hai: O (màu xanh)",
        "Hòa: Khi bàn cờ đầy mà không ai có 3 quân liên tiếp",
      ],
      tips: [
        "Chiếm vị trí giữa (ô ở chính giữa) - đây là vị trí mạnh nhất",
        "Nếu đối thủ lấy ô giữa, hãy lấy một góc",
        "Luôn chú ý chặn đi của đối thủ trước khi tấn công",
      ],
    },
    snake: {
      title: "Hướng dẫn Rắn Săn Mồi",
      icon: "🐍",
      rules: [
        "Mục tiêu: Ăn càng nhiều táo càng tốt để tăng điểm",
        "Điều khiển: Sử dụng phím mũi tên hoặc phím WASD để di chuyển",
        "↑ W: Di chuyển lên",
        "↓ S: Di chuyển xuống",
        "← A: Di chuyển trái",
        "→ D: Di chuyển phải",
        "Game Over: Khi rắn chạm vào tường hoặc cơ thể của chính mình",
      ],
      tips: [
        "Tránh chạy vào tường - đây là cách chết nhanh nhất",
        "Hãy cẩn thận khi rắn của bạn dài ra, nó khó điều khiển hơn",
        "Cố gắng tạo các mẫu chuyển động để tối đa hóa chỗ di chuyển",
        "Mỗi táo ăn được sẽ thêm 10 điểm và tăng độ dài của rắn",
      ],
    },
  };

  const gameInfo = instructions[gameSlug] || {
    title: "Hướng dẫn chơi",
    icon: "🎮",
    rules: [],
    tips: [],
  };

  return (
    <div className="game-instructions">
      <button
        className="instructions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="icon">{gameInfo.icon}</span>
        <span className="title">{gameInfo.title}</span>
        <span className="arrow">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="instructions-content">
          {gameInfo.rules.length > 0 && (
            <div className="instructions-section">
              <h4>📋 Luật chơi:</h4>
              <ul className="rules-list">
                {gameInfo.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {gameInfo.tips.length > 0 && (
            <div className="instructions-section">
              <h4>💡 Mẹo & Chiến lược:</h4>
              <ul className="tips-list">
                {gameInfo.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameInstructions;
