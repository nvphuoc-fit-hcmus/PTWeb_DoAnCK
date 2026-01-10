const { Game, GameSession, HighScore, Achievement } = require("../models");

const getGames = async (req, res) => {
  try {
    const games = await Game.findAllActive();

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

const getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const game = await Game.findBySlug(slug);

    if (!game || !game.is_active) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy game",
      });
    }

    // Parse config
    let config = {};
    try {
      config = JSON.parse(game.config || "{}");
    } catch {}

    res.json({
      success: true,
      data: { ...game, config },
    });
  } catch (error) {
    console.error("Get game error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const startGame = async (req, res) => {
  try {
    const { game_id, config } = req.body;

    const game = await Game.findById(game_id);
    if (!game || !game.is_active) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy game",
      });
    }

    const session = await GameSession.create({
      user_id: req.user.id,
      game_id,
      status: "playing",
      config: JSON.stringify(config || {}),
      time_limit: config?.time_limit || game.default_time_limit,
    });

    res.status(201).json({
      success: true,
      message: "Bắt đầu game thành công",
      data: session,
    });
  } catch (error) {
    console.error("Start game error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const saveGame = async (req, res) => {
  try {
    const { session_id, state, score, time_elapsed } = req.body;

    // Verify ownership
    const session = await GameSession.findById(session_id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy session",
      });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền lưu game này",
      });
    }

    const updated = await GameSession.saveState(
      session_id,
      state,
      score,
      time_elapsed
    );

    res.json({
      success: true,
      message: "Lưu game thành công",
      data: updated,
    });
  } catch (error) {
    console.error("Save game error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const loadGame = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await GameSession.loadState(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy game đã lưu",
      });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền load game này",
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Load game error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getSavedGames = async (req, res) => {
  try {
    const savedGames = await GameSession.getSavedGames(req.user.id);

    res.json({
      success: true,
      data: savedGames,
    });
  } catch (error) {
    console.error("Get saved games error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const finishGame = async (req, res) => {
  try {
    const { session_id, status, score, time_elapsed } = req.body;

    const session = await GameSession.findById(session_id);
    if (!session || session.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy session",
      });
    }

    // Update session
    const updated = await GameSession.update(session_id, {
      status,
      score,
      time_elapsed,
    });

    // Update high score
    const highScoreResult = await HighScore.updateHighScore(
      req.user.id,
      session.game_id,
      score,
      session_id,
      time_elapsed
    );

    // Check achievements
    const unlockedAchievements = await Achievement.checkAndUnlock(
      req.user.id,
      "score",
      score,
      session.game_id
    );

    res.json({
      success: true,
      message: "Kết thúc game thành công",
      data: {
        session: updated,
        new_high_score: highScoreResult.updated,
        unlocked_achievements: unlockedAchievements,
      },
    });
  } catch (error) {
    console.error("Finish game error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

const getRankings = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { type = "global", limit = 100 } = req.query;

    let rankings;

    switch (type) {
      case "friends":
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "Yêu cầu đăng nhập để xem ranking bạn bè",
          });
        }
        rankings = await HighScore.getFriendsRankings(
          req.user.id,
          gameId,
          parseInt(limit)
        );
        break;

      case "personal":
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "Yêu cầu đăng nhập",
          });
        }
        rankings = await HighScore.getPersonalRankings(req.user.id);
        break;

      default:
        rankings = await HighScore.getGlobalRankings(gameId, parseInt(limit));
    }

    // Add rank number
    rankings = rankings.map((r, index) => ({ ...r, rank: index + 1 }));

    res.json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    console.error("Get rankings error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
    });
  }
};

module.exports = {
  getGames,
  getGameBySlug,
  startGame,
  saveGame,
  loadGame,
  getSavedGames,
  finishGame,
  getRankings,
};
