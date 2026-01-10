const express = require("express");
const router = express.Router();
const { achievementController } = require("../controllers");
const { authenticate } = require("../middleware");

router.get("/", achievementController.getAllAchievements);

router.get("/me", authenticate, achievementController.getMyAchievements);
router.get("/user/:userId", achievementController.getUserAchievements);

module.exports = router;
