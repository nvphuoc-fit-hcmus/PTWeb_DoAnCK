import { useState, useEffect } from "react";
import { gameAPI } from "../../services/api";
import "./Ranking.css";

const Ranking = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [filterType, setFilterType] = useState("global");
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch games on mount
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gameAPI.getGames();
        const gameList = response.data.data || [];
        setGames(gameList);
        if (gameList.length > 0) {
          setSelectedGame(gameList[0].id);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };
    fetchGames();
  }, []);

  // Fetch rankings when game or filter changes
  useEffect(() => {
    const fetchRankings = async () => {
      if (!selectedGame) return;
      
      setIsLoading(true);
      try {
        const response = await gameAPI.getRankings(selectedGame, filterType);
        setRankings(response.data.data || []);
      } catch (error) {
        console.error("Error fetching rankings:", error);
        setRankings([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRankings();
  }, [selectedGame, filterType]);

  const formatTime = (seconds) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="ranking-page">
      <h1>🏆 Bảng Xếp Hạng</h1>

      {/* Filters */}
      <div className="ranking-filters">
        <div className="filter-group">
          <label>Chọn Game:</label>
          <select
            value={selectedGame || ""}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Lọc theo:</label>
          <div className="filter-buttons">
            <button
              className={filterType === "global" ? "active" : ""}
              onClick={() => setFilterType("global")}
            >
              🌍 Toàn hệ thống
            </button>
            <button
              className={filterType === "friends" ? "active" : ""}
              onClick={() => setFilterType("friends")}
            >
              👥 Bạn bè
            </button>
            <button
              className={filterType === "personal" ? "active" : ""}
              onClick={() => setFilterType("personal")}
            >
              👤 Cá nhân
            </button>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="ranking-table-container">
        {isLoading ? (
          <div className="loading">Đang tải bảng xếp hạng...</div>
        ) : rankings.length === 0 ? (
          <div className="no-data">
            <p>🎮 Chưa có dữ liệu xếp hạng</p>
            <p>Hãy chơi game để ghi danh vào bảng xếp hạng!</p>
          </div>
        ) : (
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Người chơi</th>
                <th>Điểm cao nhất</th>
                <th>Thời gian</th>
                <th>Ngày đạt</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((rank, index) => (
                <tr key={rank.id || index} className={index < 3 ? `top-${index + 1}` : ""}>
                  <td className="rank-cell">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && rank.rank}
                  </td>
                  <td className="player-cell">
                    <span className="player-name">{rank.username || rank.display_name || "Unknown"}</span>
                  </td>
                  <td className="score-cell">{rank.score?.toLocaleString() || 0}</td>
                  <td className="time-cell">{formatTime(rank.time_elapsed)}</td>
                  <td className="date-cell">
                    {rank.achieved_at
                      ? new Date(rank.achieved_at).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Ranking;
