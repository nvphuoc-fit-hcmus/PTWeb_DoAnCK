import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Quan ly Users', icon: '👥' },
    { path: '/admin/games', label: 'Quan ly Games', icon: '🎮' },
    { path: '/admin/stats', label: 'Thong ke', icon: '📈' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Link to="/" style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          marginBottom: '30px',
          color: 'var(--accent-color)'
        }}>
          🎮 Board Game
        </Link>

        <div style={{ marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          ADMIN PANEL
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                color: isActive(item.path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive(item.path) ? 'var(--bg-tertiary)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <Link to="/" style={{ 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px'
          }}>
            ← Quay lai Client
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          padding: '15px 20px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Admin Dashboard</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <span style={{ color: 'var(--text-secondary)' }}>
              👤 {user?.display_name}
            </span>
            <button className="btn btn-secondary" onClick={logout}>
              Dang xuat
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
