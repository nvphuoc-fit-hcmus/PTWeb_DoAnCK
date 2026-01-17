import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGame, setEditingGame] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getGames();
      setGames(response.data.data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const openEditModal = (game) => {
    setEditingGame(game);
    setEditForm({
      name: game.name,
      description: game.description || "",
      is_active: game.is_active,
      config: JSON.stringify(game.config || {}, null, 2),
    });
  };

  const closeModal = () => {
    setEditingGame(null);
    setEditForm({});
  };

  const handleUpdate = async () => {
    try {
      let config;
      try {
        config = JSON.parse(editForm.config);
      } catch {
        alert("Config JSON không hợp lệ!");
        return;
      }

      await adminAPI.updateGame(editingGame.id, {
        name: editForm.name,
        description: editForm.description,
        is_active: editForm.is_active,
        config,
      });

      setGames((prev) =>
        prev.map((g) =>
          g.id === editingGame.id ? { ...g, ...editForm, config } : g
        )
      );

      closeModal();
      alert("Cập nhật game thành công!");
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Lỗi khi cập nhật game!");
    }
  };

  const handleToggleActive = async (gameId, currentStatus) => {
    try {
      await adminAPI.updateGame(gameId, { is_active: !currentStatus });
      setGames((prev) =>
        prev.map((g) =>
          g.id === gameId ? { ...g, is_active: !currentStatus } : g
        )
      );
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Lỗi khi cập nhật game!");
    }
  };

  const getGameIcon = (gameName) => {
    const icons = {
      Snake: "🐍",
      "Caro 5": "⭕",
      "Caro 4": "❌",
      "Tic-tac-toe": "✖️",
      Memory: "🧠",
      "Match-3": "🍬",
      "Free Draw": "🎨",
    };
    return icons[gameName] || "🎮";
  };

  return (
    <div>
      <h1 style={{ marginBottom: "30px" }}>🎮 Quản lý Game</h1>

      {isLoading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {games.map((game) => (
            <div
              key={game.id}
              className="card"
              style={{
                opacity: game.is_active ? 1 : 0.6,
                borderLeft: `4px solid ${
                  game.is_active ? "var(--primary-color)" : "var(--text-muted)"
                }`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: "10px" }}>
                    {getGameIcon(game.name)}
                  </div>
                  <h3 style={{ margin: 0 }}>{game.name}</h3>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.875rem",
                      marginTop: "5px",
                    }}
                  >
                    {game.description || "Khong co mo ta"}
                  </p>
                </div>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    backgroundColor: game.is_active ? "#22c55e" : "#ef4444",
                    color: "white",
                  }}
                >
                  {game.is_active ? "Active" : "Disabled"}
                </span>
              </div>

              {game.config && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "var(--bg-tertiary)",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                  }}
                >
                  <strong>Config:</strong>
                  <pre
                    style={{
                      margin: "5px 0 0",
                      overflow: "auto",
                      maxHeight: "100px",
                    }}
                  >
                    {JSON.stringify(game.config, null, 2)}
                  </pre>
                </div>
              )}

              <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => openEditModal(game)}
                  style={{ flex: 1 }}
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  className={`btn ${
                    game.is_active ? "btn-icon" : "btn-primary"
                  }`}
                  onClick={() => handleToggleActive(game.id, game.is_active)}
                  title={game.is_active ? "Disable game" : "Enable game"}
                  style={{ width: "50px" }}
                >
                  {game.is_active ? "🚫" : "✅"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingGame && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>
              {getGameIcon(editingGame.name)} Chỉnh sửa {editingGame.name}
            </h2>

            <div className="form-group">
              <label className="form-label">Tên game</label>
              <input
                type="text"
                className="form-input"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea
                className="form-input"
                rows="3"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.checked })
                  }
                />
                Active
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">
                Config (JSON) - Ví dụ: kich thước bàn cờ, tốc độ,...
              </label>
              <textarea
                className="form-input"
                rows="6"
                style={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                value={editForm.config}
                onChange={(e) =>
                  setEditForm({ ...editForm, config: e.target.value })
                }
                placeholder='{"grid_size": 20, "speed": 100}'
              />
              <small style={{ color: "var(--text-muted)" }}>
                Ví dụ: {`{"grid_size": 8, "time_limit": 60}`}
              </small>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                className="btn btn-primary"
                onClick={handleUpdate}
                style={{ flex: 1 }}
              >
                💾 Lưu thay đổi
              </button>
              <button className="btn btn-secondary" onClick={closeModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameManagement;
