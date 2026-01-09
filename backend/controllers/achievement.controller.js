const { Achievement } = require('../models');

/**
 * Lấy tất cả achievements
 * GET /api/achievements
 */
const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.findAll();

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy achievements của user hiện tại
 * GET /api/achievements/me
 */
const getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.getUserAchievements(req.user.id);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error('Get my achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy achievements của một user
 * GET /api/achievements/user/:userId
 */
const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await Achievement.getUserAchievements(userId);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

module.exports = {
  getAllAchievements,
  getMyAchievements,
  getUserAchievements,
};
