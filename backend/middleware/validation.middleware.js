const { validationResult, body, param, query } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorArray = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    console.error("Validation errors:", errorArray);
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errorArray,
    });
  }

  next();
};

const authValidation = {
  register: [
    body("username")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username phải từ 3-50 ký tự")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username chỉ được chứa chữ cái, số và dấu gạch dưới"),
    body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Mật khẩu phải ít nhất 6 ký tự"),
    body("display_name")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Tên hiển thị tối đa 100 ký tự"),
    handleValidation,
  ],

  login: [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username hoặc email là bắt buộc"),
    body("password").notEmpty().withMessage("Mật khẩu là bắt buộc"),
    handleValidation,
  ],
};

const gameValidation = {
  saveGame: [
    body("game_id").isUUID().withMessage("Game ID không hợp lệ"),
    body("state").notEmpty().withMessage("Game state là bắt buộc"),
    body("score")
      .isInt({ min: 0 })
      .withMessage("Điểm số phải là số nguyên không âm"),
    body("time_elapsed")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Thời gian phải là số nguyên không âm"),
    handleValidation,
  ],

  loadGame: [
    param("id").isUUID().withMessage("Session ID không hợp lệ"),
    handleValidation,
  ],
};

const messageValidation = {
  send: [
    body("receiver_id").notEmpty().withMessage("receiver_id là bắt buộc"),
    body("content")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Nội dung tin nhắn phải từ 1-1000 ký tự"),
    handleValidation,
  ],

  getConversation: [
    param("userId").notEmpty().withMessage("User ID là bắt buộc"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit phải từ 1-100"),
    handleValidation,
  ],
};

const friendValidation = {
  request: [
    body("addressee_id").notEmpty().withMessage("addressee_id là bắt buộc"),
    handleValidation,
  ],

  respond: [
    param("requesterId").notEmpty().withMessage("Requester ID là bắt buộc"),
    body("action")
      .isIn(["accept", "reject"])
      .withMessage("Action phải là accept hoặc reject"),
    handleValidation,
  ],
};

const adminValidation = {
  updateUser: [
    param("id").isUUID().withMessage("User ID không hợp lệ"),
    body("is_active")
      .optional()
      .isBoolean()
      .withMessage("is_active phải là boolean"),
    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Role phải là user hoặc admin"),
    handleValidation,
  ],

  updateGame: [
    param("id").isUUID().withMessage("Game ID không hợp lệ"),
    body("is_active")
      .optional()
      .isBoolean()
      .withMessage("is_active phải là boolean"),
    body("config")
      .optional()
      .custom((value) => {
        // Accept object, string (JSON), or undefined
        if (value === undefined || value === null) return true;
        if (typeof value === 'object') return true;
        if (typeof value === 'string') {
          try { JSON.parse(value); return true; } catch { return false; }
        }
        return false;
      })
      .withMessage("Config phải là object hoặc JSON string hợp lệ"),
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
