const express = require("express");
const router = express.Router();
const { gameController } = require("../controllers");
const { authenticate, optionalAuth } = require("../middleware");

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get all active games
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: List of games
 */
router.get("/", gameController.getGames);

/**
 * @swagger
 * /api/games/rankings/{gameId}:
 *   get:
 *     summary: Get rankings for a game
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [global, friends, personal]
 *     responses:
 *       200:
 *         description: Rankings list
 */
router.get("/rankings/:gameId", optionalAuth, gameController.getRankings);

/**
 * @swagger
 * /api/games/{slug}:
 *   get:
 *     summary: Get game by slug
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game details with config
 *       404:
 *         description: Game not found
 */
router.get("/:slug", gameController.getGameBySlug);

/**
 * @swagger
 * /api/games/start:
 *   post:
 *     summary: Start a new game session
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *             properties:
 *               game_id:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Game session started
 */
router.post("/start", authenticate, gameController.startGame);

/**
 * @swagger
 * /api/games/save:
 *   post:
 *     summary: Save game progress
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *               - state
 *               - score
 *             properties:
 *               session_id:
 *                 type: string
 *               state:
 *                 type: object
 *               score:
 *                 type: integer
 *               time_elapsed:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Game saved successfully
 */
router.post("/save", authenticate, gameController.saveGame);

/**
 * @swagger
 * /api/games/saved/list:
 *   get:
 *     summary: Get user's saved games
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved games
 */
router.get("/saved/list", authenticate, gameController.getSavedGames);

/**
 * @swagger
 * /api/games/load/{id}:
 *   get:
 *     summary: Load a saved game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saved game data
 */
router.get("/load/:id", authenticate, gameController.loadGame);

/**
 * @swagger
 * /api/games/finish:
 *   post:
 *     summary: Finish a game session
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - session_id
 *               - status
 *               - score
 *             properties:
 *               session_id:
 *                 type: string
 *               status:
 *                 type: string
 *               score:
 *                 type: integer
 *               time_elapsed:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Game finished, returns achievements
 */
router.post("/finish", authenticate, gameController.finishGame);

module.exports = router;

