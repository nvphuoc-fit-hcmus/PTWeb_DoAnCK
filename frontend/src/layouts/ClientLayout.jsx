import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const ClientLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-container">
      <header className="header">
        <Link to="/" className="header-logo">
          🎮 Board Game
        </Link>

        <nav className="header-nav">
          <Link to="/" className={isActive("/") ? "active" : ""}>
            Trang chủ
          </Link>
          <Link to="/games" className={isActive("/games") ? "active" : ""}>
            Chọn Game
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/friends"
                className={isActive("/friends") ? "active" : ""}
              >
                Kết bạn
              </Link>
              <Link
                to="/messages"
                className={isActive("/messages") ? "active" : ""}
              >
                Tin nhắn
              </Link>
              <Link
                to="/profile"
                className={isActive("/profile") ? "active" : ""}
              >
                Hồ sơ
              </Link>
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className={isActive("/admin") ? "active" : ""}
                >
                  Quản trị
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? "🌙" : "☀️"}
          </button>

          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "var(--text-secondary)" }}>
                Xin chào,{" "}
                <strong>{user?.display_name || user?.username}</strong>
              </span>
              <button className="btn btn-secondary" onClick={logout}>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/login" className="btn btn-secondary">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer
        style={{
          padding: "20px",
          textAlign: "center",
          borderTop: "1px solid var(--border-color)",
          color: "var(--text-muted)",
        }}
      >
        © 2026 Board Game Platform - Đồ án Phát triển Web HCMUS
      </footer>
    </div>
  );
};

export default ClientLayout;
