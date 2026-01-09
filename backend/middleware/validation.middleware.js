const { validationResult, body, param, query } = require('express-validator');

/**
 * Middleware xử lý kết quả validation
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Du lieu khong hop le',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
};

/**
 * Validation rules cho Authentication
 */
const authValidation = {
  register: [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username phai tu 3-50 ky tu')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username chi duoc chua chu cai, so va dau gach duoi'),
    body('email')
      .isEmail()
      .withMessage('Email khong hop le')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Mat khau phai it nhat 6 ky tu'),
    body('display_name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Ten hien thi toi da 100 ky tu'),
    handleValidation,
  ],

  login: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username hoac email la bat buoc'),
    body('password')
      .notEmpty()
      .withMessage('Mat khau la bat buoc'),
    handleValidation,
  ],
};

/**
 * Validation rules cho Game
 */
const gameValidation = {
  saveGame: [
    body('game_id')
      .isUUID()
      .withMessage('Game ID khong hop le'),
    body('state')
      .notEmpty()
      .withMessage('Game state la bat buoc'),
    body('score')
      .isInt({ min: 0 })
      .withMessage('Diem so phai la so nguyen khong am'),
    body('time_elapsed')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Thoi gian phai la so nguyen khong am'),
    handleValidation,
  ],

  loadGame: [
    param('id')
      .isUUID()
      .withMessage('Session ID khong hop le'),
    handleValidation,
  ],
};

/**
 * Validation rules cho Messages
 */
const messageValidation = {
  send: [
    body('receiver_id')
      .isUUID()
      .withMessage('Receiver ID khong hop le'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Noi dung tin nhan phai tu 1-1000 ky tu'),
    handleValidation,
  ],

  getConversation: [
    param('userId')
      .isUUID()
      .withMessage('User ID khong hop le'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit phai tu 1-100'),
    handleValidation,
  ],
};

/**
 * Validation rules cho Friends
 */
const friendValidation = {
  request: [
    body('addressee_id')
      .isUUID()
      .withMessage('User ID khong hop le'),
    handleValidation,
  ],

  respond: [
    param('requesterId')
      .isUUID()
      .withMessage('Requester ID khong hop le'),
    body('action')
      .isIn(['accept', 'reject'])
      .withMessage('Action phai la accept hoac reject'),
    handleValidation,
  ],
};

/**
 * Validation rules cho Admin
 */
const adminValidation = {
  updateUser: [
    param('id')
      .isUUID()
      .withMessage('User ID khong hop le'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active phai la boolean'),
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role phai la user hoac admin'),
    handleValidation,
  ],

  updateGame: [
    param('id')
      .isUUID()
      .withMessage('Game ID khong hop le'),
    body('is_active')
      .optional()
      .isBoolean()
      .withMessage('is_active phai la boolean'),
    body('config')
      .optional()
      .isObject()
      .withMessage('Config phai la object'),
    handleValidation,
  ],
};

module.exports = {
  handleValidation,
  authValidation,
  gameValidation,
  messageValidation,
  friendValidation,
  adminValidation,
};
