import { useState, useEffect } from "react";
import { adminAPI, gameAPI } from "../../services/api";

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, gamesRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getGames(),
        ]);
        setStats(statsRes.data.data);
        setGames(gamesRes.data.data || []);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="loading">Đang tải thống kê...</div>;
  }

  // Calculate game statistics
  const activeGames = games.filter((g) => g.is_active).length;
  const inactiveGames = games.length - activeGames;

  return (
    <div>
      <h1 style={{ marginBottom: "30px" }}>📈 Thống Kê Chi Tiết</h1>

      {/* User Statistics */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "20px" }}>👥 Thống Kê Người Dùng</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <StatCard
            label="Tổng người dùng"
            value={stats?.total_users || 0}
            icon="👥"
            color="#3b82f6"
          />
          <StatCard
            label="Người dùng active"
            value={stats?.active_users || 0}
            icon="✅"
            color="#22c55e"
          />
          <StatCard
            label="Tỷ lệ active"
            value={`${stats?.total_users ? Math.round((stats.active_users / stats.total_users) * 100) : 0}%`}
            icon="📊"
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* Game Statistics */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "20px" }}>🎮 Thống Kê Game</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <StatCard
            label="Tổng số game"
            value={stats?.total_games || games.length}
            icon="🎮"
            color="#f59e0b"
          />
          <StatCard
            label="Game đang hoạt động"
            value={activeGames}
            icon="✅"
            color="#22c55e"
          />
          <StatCard
            label="Game bị vô hiệu"
            value={inactiveGames}
            icon="🚫"
            color="#ef4444"
          />
        </div>
      </div>

      {/* Play Statistics */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "20px" }}>📊 Thống Kê Lượt Chơi</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <StatCard
            label="Tổng lượt chơi"
            value={stats?.total_sessions || 0}
            icon="🎯"
            color="#3b82f6"
          />
          <StatCard
            label="Lượt chơi 24h qua"
            value={stats?.sessions_last_24h || 0}
            icon="⏰"
            color="#ef4444"
          />
          <StatCard
            label="Trung bình/ngày"
            value={Math.round((stats?.total_sessions || 0) / 30)}
            icon="📈"
            color="#8b5cf6"
            description="(Ước tính 30 ngày)"
          />
        </div>
      </div>

      {/* Game List with Status */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>🎮 Danh Sách Game & Trạng Thái</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
              <th style={thStyle}>Game</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                <td style={tdStyle}>
                  <strong>{game.name}</strong>
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      backgroundColor: game.is_active ? "#22c55e" : "#ef4444",
                      color: "white",
                    }}
                  >
                    {game.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td style={tdStyle}>{game.description || "Không có mô tả"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon, color, description }) => (
  <div
    style={{
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: "var(--bg-tertiary)",
      borderLeft: `4px solid ${color}`,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "8px" }}>
          {label}
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: "bold", color }}>
          {value}
        </div>
        {description && (
          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "4px" }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ fontSize: "2rem" }}>{icon}</div>
    </div>
  </div>
);

const thStyle = {
  textAlign: "left",
  padding: "12px",
  color: "var(--text-secondary)",
  fontWeight: "600",
};

const tdStyle = {
  padding: "12px",
};

export default Statistics;
