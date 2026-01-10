import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    display_name: "",
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");
  };

  const validate = () => {
    const newErrors = {};

    if (formData.username.length < 3) {
      newErrors.username = "Username phải có ít nhất 3 ký tự";
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username chỉ được chứa chữ cái, số và dấu gạch dưới";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setGlobalError("");

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      display_name: formData.display_name || formData.username,
    });

    if (result.success) {
      navigate("/");
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
        <h1 className="auth-title">🎮 Đăng Ký</h1>
        <p className="auth-subtitle">Tạo tài khoản để bắt đầu chơi!</p>
      </div>

      {globalError && <div className="alert alert-error">{globalError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Tên đăng nhập *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-input"
            placeholder="Nhập username (vd: player123)"
            value={formData.username}
            onChange={handleChange}
            required
            autoFocus
          />
          {errors.username && (
            <div className="form-error">{errors.username}</div>
          )}
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
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="display_name">
            Tên hiển thị
          </label>
          <input
            type="text"
            id="display_name"
            name="display_name"
            className="form-input"
            placeholder="Tên sẽ hiển thị trong game (tùy chọn)"
            value={formData.display_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Mật khẩu *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && (
            <div className="form-error">{errors.password}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Xác nhận mật khẩu *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            placeholder="Nhập lại mật khẩu"
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
          style={{ width: "100%", marginTop: "10px" }}
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Đăng Ký"}
        </button>
      </form>

      <div className="auth-footer">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </div>
    </div>
  );
};

export default Register;
