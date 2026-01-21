const { User, Game, GameSession, Achievement } = require("../models");
const db = require("../database/db");

const getStats = async (req, res) => {
  try {
    const [usersCount] = await db("users").count();
    const [gamesCount] = await db("games").count();
    const [sessionsCount] = await db("game_sessions").count();
    const [activeUsersCount] = await db("users")
      .where({ is_active: true })
      .count();

    const recentSessions = await db("game_sessions")
      .count()
      .where("created_at", ">", db.raw("NOW() - INTERVAL '24 hours'"));

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
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

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
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, role } = req.body;

    if (id === req.user.id && is_active === false) {
      return res.status(400).json({
        success: false,
        message: "Không thể vô hiệu hóa tài khoản của chính mình",
      });
    }

    const updateData = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (role !== undefined) updateData.role = role;

    const user = await User.update(id, updateData);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Nguời dùng không tồn tại",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật người dùng thành công",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Không thể tự xóa tài khoản của mình",
      });
    }

    await User.delete(id);

    res.json({
      success: true,
      message: "Đã xóa người dùng",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getGames = async (req, res) => {
  try {
    const games = await Game.findAll();

    res.json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error("Get games error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const updateGame = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active, config, default_time_limit } = req.body;

    console.log("Update game request:", { id, body: req.body });

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (config !== undefined) updateData.config = JSON.stringify(config);
    if (default_time_limit !== undefined)
      updateData.default_time_limit = default_time_limit;

    console.log("Update data:", updateData);

    const game = await Game.update(id, updateData);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game không tồn tại",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật game thành công",
      data: game,
    });
  } catch (error) {
    console.error("Update game error:", error);
    console.error("Error details:", error.message, error.code, error.detail);
    res.status(500).json({
      success: false,
      message: `Lỗi: ${error.message || "Lỗi hệ thống"}`,
    });
  }
};

const createAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);

    res.status(201).json({
      success: true,
      message: "Tạo achievement thành công",
      data: achievement,
    });
  } catch (error) {
    console.error("Create achievement error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.update(id, req.body);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement không tồn tại",
      });
    }

    res.json({
      success: true,
      message: "Cập nhật achievement thành công",
      data: achievement,
    });
  } catch (error) {
    console.error("Update achievement error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    await Achievement.delete(id);

    res.json({
      success: true,
      message: "Đã xóa achievement",
    });
  } catch (error) {
    console.error("Delete achievement error:", error);
    res.status(500).json({
      success: false,
      message: "ỗi hệ thống",
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
