const express = require("express");
const router = express.Router();
const { adminController } = require("../controllers");
const {
  authenticate,
  requireAdmin,
  adminValidation,
} = require("../middleware");

router.use(authenticate);
router.use(requireAdmin);

router.get("/stats", adminController.getStats);

router.get("/users", adminController.getUsers);
router.put(
  "/users/:id",
  adminValidation.updateUser,
  adminController.updateUser
);
router.delete("/users/:id", adminController.deleteUser);

router.get("/games", adminController.getGames);
router.put(
  "/games/:id",
  adminValidation.updateGame,
  adminController.updateGame
);

router.post("/achievements", adminController.createAchievement);
router.put("/achievements/:id", adminController.updateAchievement);
router.delete("/achievements/:id", adminController.deleteAchievement);

module.exports = router;
