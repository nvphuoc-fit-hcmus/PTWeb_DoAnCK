const { Friendship, User } = require("../models");

const sendRequest = async (req, res) => {
  try {
    const { addressee_id } = req.body;

    console.log("Friend request body:", req.body);
    console.log("addressee_id:", addressee_id);

    if (addressee_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Không thể kết bạn với chính mình",
      });
    }

    // Check if user exists
    const addressee = await User.findById(addressee_id);
    if (!addressee) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    const result = await Friendship.sendRequest(req.user.id, addressee_id);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: result.existing,
      });
    }

    res.status(201).json({
      success: true,
      message: "Đã gửi lời mời kết bạn",
      data: result,
    });
  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const respondRequest = async (req, res) => {
  try {
    const { requesterId } = req.params;
    const { action } = req.body;

    let result;
    if (action === "accept") {
      result = await Friendship.acceptRequest(requesterId, req.user.id);
    } else {
      result = await Friendship.rejectRequest(requesterId, req.user.id);
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lời mời kết bạn",
      });
    }

    res.json({
      success: true,
      message:
        action === "accept" ? "Đã chấp nhận lời mời" : "Đã từ chối lời mời",
      data: result,
    });
  } catch (error) {
    console.error("Respond friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const pending = await Friendship.getPendingRequests(req.user.id);

    res.json({
      success: true,
      data: pending,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getFriends = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const friends = await Friendship.getFriends(req.user.id, page, limit);

    res.json({
      success: true,
      ...friends, // Contains { data, pagination }
    });
  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const unfriend = async (req, res) => {
  try {
    const { userId } = req.params;

    await Friendship.unfriend(req.user.id, userId);

    res.json({
      success: true,
      message: "Đã hủy kết bạn",
    });
  } catch (error) {
    console.error("Unfriend error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

module.exports = {
  sendRequest,
  respondRequest,
  getPendingRequests,
  getFriends,
  unfriend,
};
