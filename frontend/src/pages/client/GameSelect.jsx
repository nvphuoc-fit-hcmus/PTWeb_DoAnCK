import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gameAPI } from "../../services/api";

const GameSelect = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gameAPI.getGames();
        setGames(response.data.data || []);
      } catch (error) {
        console.error("Error fetching games:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (isLoading) {
    return <div className="loading">Đang tải danh sách game...</div>;
  }

  const handlePlayGame = (slug) => {
    const gameRoutes = {
      "match-3": "/games/match3",
      memory: "/games/memory",
      "free-draw": "/games/freedraw",
      snake: "/games/snake",
      "caro-5": "/games/caro5",
      "caro-4": "/games/caro4",
      "tic-tac-toe": "/games/tictactoe",
    };

    const route = gameRoutes[slug];
    if (route) {
      navigate(route);
    } else {
      alert("Game này đang được phát triển!");
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>
        🎮 Chọn trò chơi
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="card"
            style={{
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "15px",
                textAlign: "center",
              }}
            >
              {getGameIcon(game.slug)}
            </div>
            <h3 style={{ marginBottom: "10px", textAlign: "center" }}>
              {game.name}
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              {game.description}
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => handlePlayGame(game.slug)}
            >
              Chơi ngay
            </button>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--text-muted)",
          }}
        >
          Chưa có game nào. Hay liên hệ admin để thêm game!
        </div>
      )}
    </div>
  );
};

const getGameIcon = (slug) => {
  const icons = {
    "caro-5": "⭕",
    "caro-4": "🔴",
    "tic-tac-toe": "❌",
    snake: "🐍",
    "match-3": "💎",
    memory: "🧠",
    "free-draw": "🎨",
  };
  return icons[slug] || "🎮";
};

export default GameSelect;
