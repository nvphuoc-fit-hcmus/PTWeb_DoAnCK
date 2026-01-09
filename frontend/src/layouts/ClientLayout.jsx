import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

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
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            Trang chu
          </Link>
          <Link to="/games" className={isActive('/games') ? 'active' : ''}>
            Chon Game
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>
                Ho so
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                  Quan tri
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Xin chao, <strong>{user?.display_name || user?.username}</strong>
              </span>
              <button className="btn btn-secondary" onClick={logout}>
                Dang xuat
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary">
                Dang nhap
              </Link>
              <Link to="/register" className="btn btn-primary">
                Dang ky
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer style={{ 
        padding: '20px', 
        textAlign: 'center', 
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)'
      }}>
        © 2026 Board Game Platform - Do an Phat trien Web HCMUS
      </footer>
    </div>
  );
};

export default ClientLayout;
