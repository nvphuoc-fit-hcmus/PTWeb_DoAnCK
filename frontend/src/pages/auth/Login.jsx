import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">🎮 Dang Nhap</h1>
        <p className="auth-subtitle">Chao mung ban quay tro lai!</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Ten dang nhap hoac Email
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-input"
            placeholder="Nhap username hoac email"
            value={formData.username}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mat khau
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            placeholder="Nhap mat khau"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
          disabled={isLoading}
        >
          {isLoading ? 'Dang xu ly...' : 'Dang Nhap'}
        </button>
      </form>

      <div className="auth-footer">
        Chua co tai khoan?{' '}
        <Link to="/register">Dang ky ngay</Link>
      </div>

      {/* Demo accounts info */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: 'var(--bg-tertiary)', 
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        <strong>Tai khoan demo:</strong>
        <br />
        Admin: admin / 123456
        <br />
        User: player1 / 123456
      </div>
    </div>
  );
};

export default Login;
