const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Tạo JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Đăng ký tài khoản mới
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;

    // Check username exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Username da ton tai',
      });
    }

    // Check email exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email da duoc su dung',
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      display_name,
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Dang ky thanh cong',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong khi dang ky',
    });
  }
};

/**
 * Đăng nhập
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    let user = await User.findByUsername(username);
    if (!user) {
      user = await User.findByEmail(username);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Thong tin dang nhap khong chinh xac',
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Thong tin dang nhap khong chinh xac',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Tai khoan da bi khoa',
      });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Dang nhap thanh cong',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          avatar_config: user.avatar_config,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong khi dang nhap',
    });
  }
};

/**
 * Lấy thông tin user hiện tại
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const profile = await User.getProfile(req.user.id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay nguoi dung',
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Đổi mật khẩu
 * PUT /api/auth/password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isValid = await User.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Mat khau hien tai khong chinh xac',
      });
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(newPassword, 10);
    
    await User.update(req.user.id, { password_hash });

    res.json({
      success: true,
      message: 'Doi mat khau thanh cong',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
