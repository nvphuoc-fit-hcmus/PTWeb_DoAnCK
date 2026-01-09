const { User, Game, GameSession, Achievement } = require('../models');
const db = require('../database/db');

/**
 * Lấy thống kê tổng quan
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
  try {
    const [usersCount] = await db('users').count();
    const [gamesCount] = await db('games').count();
    const [sessionsCount] = await db('game_sessions').count();
    const [activeUsersCount] = await db('users').where({ is_active: true }).count();
    
    // Get recent activity
    const recentSessions = await db('game_sessions')
      .count()
      .where('created_at', '>', db.raw("NOW() - INTERVAL '24 hours'"));

    res.json({
      success: true,
      data: {
        total_users: parseInt(usersCount.count),
        active_users: parseInt(activeUsersCount.count),
        total_games: parseInt(gamesCount.count),
        total_sessions: parseInt(sessionsCount.count),
        sessions_last_24h: parseInt(recentSessions[0].count),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy danh sách users (Admin)
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const result = await User.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Cập nhật user (Admin)
 * PUT /api/admin/users/:id
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body;
    
    // Prevent admin from deactivating themselves
    if (id === req.user.id && is_active === false) {
      return res.status(400).json({
        success: false,
        message: 'Khong the tu khoa tai khoan cua minh',
      });
    }

    const updateData = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (role !== undefined) updateData.role = role;

    const user = await User.update(id, updateData);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nguoi dung khong ton tai',
      });
    }

    res.json({
      success: true,
      message: 'Cap nhat nguoi dung thanh cong',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Xóa user (Admin)
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Khong the tu xoa tai khoan cua minh',
      });
    }

    await User.delete(id);

    res.json({
      success: true,
      message: 'Da xoa nguoi dung',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy danh sách games (Admin)
 * GET /api/admin/games
 */
const getGames = async (req, res) => {
  try {
    const games = await Game.findAll();

    res.json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Cập nhật game (Admin)
 * PUT /api/admin/games/:id
 */
const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, config, default_time_limit } = req.body;
    
    const updateData = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (config !== undefined) updateData.config = JSON.stringify(config);
    if (default_time_limit !== undefined) updateData.default_time_limit = default_time_limit;

    const game = await Game.update(id, updateData);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game khong ton tai',
      });
    }

    res.json({
      success: true,
      message: 'Cap nhat game thanh cong',
      data: game,
    });
  } catch (error) {
    console.error('Update game error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Quản lý achievements (Admin)
 * POST /api/admin/achievements
 */
const createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Tao achievement thanh cong',
      data: achievement,
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Cập nhật achievement (Admin)
 * PUT /api/admin/achievements/:id
 */
const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.update(id, req.body);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement khong ton tai',
      });
    }

    res.json({
      success: true,
      message: 'Cap nhat achievement thanh cong',
      data: achievement,
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Xóa achievement (Admin)
 * DELETE /api/admin/achievements/:id
 */
const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    await Achievement.delete(id);

    res.json({
      success: true,
      message: 'Da xoa achievement',
    });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  getGames,
  updateGame,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
