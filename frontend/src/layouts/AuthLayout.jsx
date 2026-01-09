import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  if (isLoading) {
    return <div className="loading">Dang tai...</div>;
  }

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-container">
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        style={{ position: 'absolute', top: 20, right: 20 }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
