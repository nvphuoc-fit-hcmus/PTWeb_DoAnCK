import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      <section
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background:
            "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)",
          borderRadius: "16px",
          marginBottom: "40px",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", marginBottom: "16px" }}>
          🎮 Board Game Platform
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--text-secondary)",
            maxWidth: "600px",
            margin: "0 auto 30px",
          }}
        >
          Chơi các trò chơi cổ điển trên giao diện LED matrix độc đáo. Điều
          khiển chỉ với 5 nút: Left, Right, Enter, Back, Hint!
        </p>

        {isAuthenticated ? (
          <div>
            <p style={{ marginBottom: "20px", color: "var(--text-secondary)" }}>
              Chào mừng, <strong>{user?.display_name}</strong>! Sẵn sàng chơi
              chưa?
            </p>
            <Link
              to="/games"
              className="btn btn-primary"
              style={{ fontSize: "1.1rem", padding: "14px 32px" }}
            >
              🎯 Chọn Game
            </Link>
          </div>
        ) : (
          <div
            style={{ display: "flex", gap: "15px", justifyContent: "center" }}
          >
            <Link
              to="/login"
              className="btn btn-secondary"
              style={{ fontSize: "1.1rem", padding: "14px 32px" }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
              style={{ fontSize: "1.1rem", padding: "14px 32px" }}
            >
              Bắt đầu chơi
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: "24px", textAlign: "center" }}>
          🎯 Các trò chơi có sẵn
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {[
            {
              name: "Caro 5",
              icon: "⭕",
              desc: "Xếp 5 quân liên tiếp để thắng",
            },
            {
              name: "Caro 4",
              icon: "🔴",
              desc: "Xếp 4 quân - Nhanh và thú vị",
            },
            { name: "Tic-Tac-Toe", icon: "❌", desc: "Game cổ điển 3x3" },
            { name: "Snake", icon: "🐍", desc: "Rắn săn mồi - ên cấp!" },
            { name: "Match-3", icon: "💎", desc: "Ghép 3 viên giống nhau" },
            { name: "Memory", icon: "🧠", desc: "Lật thẻ và nhớ vị trí" },
            { name: "Free Draw", icon: "🎨", desc: "Vẽ tự do trên LED matrix" },
          ].map((game) => (
            <div
              key={game.name}
              className="card"
              style={{ textAlign: "center" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                {game.icon}
              </div>
              <h3 style={{ marginBottom: "8px" }}>{game.name}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                {game.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "60px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "24px" }}>🕹️ Điều khiển</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "←", label: "Left", color: "#3b82f6" },
            { key: "→", label: "Right", color: "#3b82f6" },
            { key: "Enter", label: "Select", color: "#22c55e" },
            { key: "Esc", label: "Back", color: "#ef4444" },
            { key: "H", label: "Hint", color: "#f59e0b" },
          ].map((btn) => (
            <div
              key={btn.key}
              style={{
                padding: "15px 25px",
                backgroundColor: "var(--bg-secondary)",
                border: `2px solid ${btn.color}`,
                borderRadius: "12px",
                minWidth: "100px",
              }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: btn.color,
                  marginBottom: "5px",
                }}
              >
                {btn.key}
              </div>
              <div
                style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
              >
                {btn.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
