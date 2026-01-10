const { Achievement } = require("../models");

const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.findAll();

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.getUserAchievements(req.user.id);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error("Get my achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await Achievement.getUserAchievements(userId);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error("Get user achievements error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

module.exports = {
  getAllAchievements,
  getMyAchievements,
  getUserAchievements,
};
