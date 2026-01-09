import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    display_name: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const validate = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = 'Username phai co it nhat 3 ky tu';
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username chi duoc chua chu cai, so va dau gach duoi';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email khong hop le';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Mat khau phai co it nhat 6 ky tu';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mat khau xac nhan khong khop';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    setGlobalError('');

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      display_name: formData.display_name || formData.username,
    });

    if (result.success) {
      navigate('/');
    } else {
      if (result.errors) {
        const newErrors = {};
        result.errors.forEach((err) => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      } else {
        setGlobalError(result.message);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-title">🎮 Dang Ky</h1>
        <p className="auth-subtitle">Tao tai khoan de bat dau choi!</p>
      </div>

      {globalError && <div className="alert alert-error">{globalError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Ten dang nhap *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-input"
            placeholder="Nhap username (vd: player123)"
            value={formData.username}
            onChange={handleChange}
            required
            autoFocus
          />
          {errors.username && <div className="form-error">{errors.username}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            placeholder="Nhap email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="display_name">
            Ten hien thi
          </label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            className="form-input"
            placeholder="Ten se hien thi trong game (tuy chon)"
            value={formData.display_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mat khau *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            placeholder="Nhap mat khau (it nhat 6 ky tu)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Xac nhan mat khau *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            placeholder="Nhap lai mat khau"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && (
            <div className="form-error">{errors.confirmPassword}</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '10px' }}
          disabled={isLoading}
        >
          {isLoading ? 'Dang xu ly...' : 'Dang Ky'}
        </button>
      </form>

      <div className="auth-footer">
        Da co tai khoan?{' '}
        <Link to="/login">Dang nhap</Link>
      </div>
    </div>
  );
};

export default Register;
