const express = require("express");
const router = express.Router();
const { gameController } = require("../controllers");
const { authenticate, optionalAuth } = require("../middleware");

router.get("/", gameController.getGames);
router.get("/rankings/:gameId", optionalAuth, gameController.getRankings);
router.get("/:slug", gameController.getGameBySlug);

router.post("/start", authenticate, gameController.startGame);
router.post("/save", authenticate, gameController.saveGame);
router.get("/saved/list", authenticate, gameController.getSavedGames);
router.get("/load/:id", authenticate, gameController.loadGame);
router.post("/finish", authenticate, gameController.finishGame);

module.exports = router;
