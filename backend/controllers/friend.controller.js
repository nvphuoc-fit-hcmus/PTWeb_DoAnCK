const { Friendship, User } = require('../models');

/**
 * Gửi lời mời kết bạn
 * POST /api/friends/request
 */
const sendRequest = async (req, res) => {
  try {
    const { addressee_id } = req.body;
    
    if (addressee_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Khong the ket ban voi chinh minh',
      });
    }

    // Check if user exists
    const addressee = await User.findById(addressee_id);
    if (!addressee) {
      return res.status(404).json({
        success: false,
        message: 'Nguoi dung khong ton tai',
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
      message: 'Da gui loi moi ket ban',
      data: result,
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Phản hồi lời mời kết bạn
 * PUT /api/friends/respond/:requesterId
 */
const respondRequest = async (req, res) => {
  try {
    const { requesterId } = req.params;
    const { action } = req.body;
    
    let result;
    if (action === 'accept') {
      result = await Friendship.acceptRequest(requesterId, req.user.id);
    } else {
      result = await Friendship.rejectRequest(requesterId, req.user.id);
    }

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay loi moi ket ban',
      });
    }

    res.json({
      success: true,
      message: action === 'accept' ? 'Da chap nhan loi moi' : 'Da tu choi loi moi',
      data: result,
    });
  } catch (error) {
    console.error('Respond friend request error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy danh sách lời mời đang chờ
 * GET /api/friends/pending
 */
const getPendingRequests = async (req, res) => {
  try {
    const pending = await Friendship.getPendingRequests(req.user.id);
    
    res.json({
      success: true,
      data: pending,
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy danh sách bạn bè
 * GET /api/friends
 */
const getFriends = async (req, res) => {
  try {
    const friends = await Friendship.getFriends(req.user.id);
    
    res.json({
      success: true,
      data: friends,
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Hủy kết bạn
 * DELETE /api/friends/:userId
 */
const unfriend = async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Friendship.unfriend(req.user.id, userId);
    
    res.json({
      success: true,
      message: 'Da huy ket ban',
    });
  } catch (error) {
    console.error('Unfriend error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
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
