const { User } = require("../models");

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await User.getProfile(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { display_name, bio, avatar_config } = req.body;

    const updateData = {};
    if (display_name !== undefined) updateData.display_name = display_name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar_config !== undefined) updateData.avatar_config = avatar_config;

    const user = await User.update(req.user.id, updateData);

    res.json({
      success: true,
      message: "Cập nhật profile thành công",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    const result = await User.findAll({
      search: q,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
};
