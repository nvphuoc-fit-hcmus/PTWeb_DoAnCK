const { Game, GameSession, HighScore, Achievement } = require('../models');

/**
 * Lấy danh sách games
 * GET /api/games
 */
const getGames = async (req, res) => {
  try {
    const games = await Game.findAllActive();
    
    res.json({
      success: true,
      data: games,
    });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy thông tin game theo slug
 * GET /api/games/:slug
 */
const getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const game = await Game.findBySlug(slug);
    
    if (!game || !game.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay game',
      });
    }

    // Parse config
    let config = {};
    try {
      config = JSON.parse(game.config || '{}');
    } catch {}

    res.json({
      success: true,
      data: { ...game, config },
    });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Bắt đầu game session mới
 * POST /api/games/start
 */
const startGame = async (req, res) => {
  try {
    const { game_id, config } = req.body;
    
    const game = await Game.findById(game_id);
    if (!game || !game.is_active) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay game',
      });
    }

    const session = await GameSession.create({
      user_id: req.user.id,
      game_id,
      status: 'playing',
      config: JSON.stringify(config || {}),
      time_limit: config?.time_limit || game.default_time_limit,
    });

    res.status(201).json({
      success: true,
      message: 'Bat dau game thanh cong',
      data: session,
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lưu trạng thái game
 * POST /api/games/save
 */
const saveGame = async (req, res) => {
  try {
    const { session_id, state, score, time_elapsed } = req.body;
    
    // Verify ownership
    const session = await GameSession.findById(session_id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay session',
      });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Khong co quyen luu game nay',
      });
    }

    const updated = await GameSession.saveState(session_id, state, score, time_elapsed);

    res.json({
      success: true,
      message: 'Luu game thanh cong',
      data: updated,
    });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Load trạng thái game
 * GET /api/games/load/:id
 */
const loadGame = async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await GameSession.loadState(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay game da luu',
      });
    }

    if (session.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Khong co quyen load game nay',
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Load game error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy danh sách games đã lưu
 * GET /api/games/saved
 */
const getSavedGames = async (req, res) => {
  try {
    const savedGames = await GameSession.getSavedGames(req.user.id);
    
    res.json({
      success: true,
      data: savedGames,
    });
  } catch (error) {
    console.error('Get saved games error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Kết thúc game và cập nhật điểm
 * POST /api/games/finish
 */
const finishGame = async (req, res) => {
  try {
    const { session_id, status, score, time_elapsed } = req.body;
    
    const session = await GameSession.findById(session_id);
    if (!session || session.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Khong tim thay session',
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
      'score',
      score,
      session.game_id
    );

    res.json({
      success: true,
      message: 'Ket thuc game thanh cong',
      data: {
        session: updated,
        new_high_score: highScoreResult.updated,
        unlocked_achievements: unlockedAchievements,
      },
    });
  } catch (error) {
    console.error('Finish game error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
    });
  }
};

/**
 * Lấy bảng xếp hạng
 * GET /api/games/rankings/:gameId
 */
const getRankings = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { type = 'global', limit = 100 } = req.query;
    
    let rankings;
    
    switch (type) {
      case 'friends':
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Yeu cau dang nhap de xem ranking ban be',
          });
        }
        rankings = await HighScore.getFriendsRankings(req.user.id, gameId, parseInt(limit));
        break;
      
      case 'personal':
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Yeu cau dang nhap',
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
    console.error('Get rankings error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi he thong',
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
