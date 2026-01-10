import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { userAPI, achievementAPI } from "../../services/api";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, achievementsRes] = await Promise.all([
          userAPI.getProfile(user.id),
          achievementAPI.getMyAchievements(),
        ]);

        setProfile(profileRes.data.data);
        setAchievements(achievementsRes.data.data || []);
        setFormData({
          display_name: profileRes.data.data.display_name || "",
          bio: profileRes.data.data.bio || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const handleSave = async () => {
    try {
      await userAPI.updateProfile(formData);
      updateUser(formData);
      setProfile((prev) => ({ ...prev, ...formData }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Lỗi khi cập nhật profile!");
    }
  };

  if (isLoading) {
    return <div className="loading">Đang tải thông tin...</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "30px" }}>👤 Hồ sơ cá nhân</h1>

      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
              color: "white",
            }}
          >
            {profile?.display_name?.[0]?.toUpperCase() || "?"}
          </div>

          <div style={{ flex: 1 }}>
            {isEditing ? (
              <>
                <div className="form-group">
                  <label className="form-label">Tên hiển thị</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.display_name}
                    onChange={(e) =>
                      setFormData({ ...formData, display_name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới thiệu</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Viet gi do ve ban than..."
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn btn-primary" onClick={handleSave}>
                    Lưu
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Hủy
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ marginBottom: "8px" }}>{profile?.display_name}</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "8px" }}>
                  @{profile?.username}
                </p>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                  }}
                >
                  {profile?.bio || "Chua co gioi thieu"}
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Chỉnh sửa
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Tổng game",
            value: profile?.stats?.total_games || 0,
            icon: "🎮",
          },
          { label: "Thắng", value: profile?.stats?.wins || 0, icon: "🏆" },
          { label: "Thua", value: profile?.stats?.losses || 0, icon: "💔" },
          {
            label: "Thành tựu",
            value: profile?.stats?.achievements || 0,
            icon: "⭐",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              {stat.value}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>⭐ Thành tựu</h3>
        {achievements.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bg-tertiary)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>🏅</span>
                <div>
                  <div style={{ fontWeight: "500" }}>{achievement.name}</div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                  >
                    +{achievement.points} diem
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>
            Chưa mở khóa thành tựu nào. Hay chơi game để mở khóa!
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
