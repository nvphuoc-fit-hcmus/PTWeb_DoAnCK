const db = require('../database/db');

const HighScore = {
  tableName: 'high_scores',

  // Get or create high score
  async updateHighScore(userId, gameId, score, sessionId = null, timeElapsed = null) {
    const existing = await db(this.tableName)
      .where({ user_id: userId, game_id: gameId })
      .first();

    if (existing) {
      // Only update if new score is higher
      if (score > existing.score) {
        const [updated] = await db(this.tableName)
          .where({ id: existing.id })
          .update({
            score,
            session_id: sessionId,
            time_elapsed: timeElapsed,
            updated_at: db.fn.now(),
          })
          .returning('*');
        return { updated: true, highScore: updated };
      }
      return { updated: false, highScore: existing };
    }

    // Create new high score
    const [highScore] = await db(this.tableName)
      .insert({
        user_id: userId,
        game_id: gameId,
        score,
        session_id: sessionId,
        time_elapsed: timeElapsed,
      })
      .returning('*');
    
    return { updated: true, highScore };
  },

  // Get global rankings for a game
  async getGlobalRankings(gameId, limit = 100) {
    return db(this.tableName)
      .join('users', 'high_scores.user_id', 'users.id')
      .where({ game_id: gameId })
      .select(
        'high_scores.score',
        'high_scores.time_elapsed',
        'high_scores.updated_at',
        'users.id as user_id',
        'users.username',
        'users.display_name',
        'users.avatar_config'
      )
      .orderBy('high_scores.score', 'desc')
      .limit(limit);
  },

  // Get friends rankings for a game
  async getFriendsRankings(userId, gameId, limit = 100) {
    // Get friend IDs
    const friends = await db('friendships')
      .where(function() {
        this.where({ requester_id: userId, status: 'accepted' })
          .orWhere({ addressee_id: userId, status: 'accepted' });
      })
      .select('requester_id', 'addressee_id');

    const friendIds = friends.map(f => 
      f.requester_id === userId ? f.addressee_id : f.requester_id
    );
    friendIds.push(userId); // Include self

    return db(this.tableName)
      .join('users', 'high_scores.user_id', 'users.id')
      .where({ game_id: gameId })
      .whereIn('high_scores.user_id', friendIds)
      .select(
        'high_scores.score',
        'high_scores.time_elapsed',
        'high_scores.updated_at',
        'users.id as user_id',
        'users.username',
        'users.display_name',
        'users.avatar_config'
      )
      .orderBy('high_scores.score', 'desc')
      .limit(limit);
  },

  // Get personal rankings (all games for a user)
  async getPersonalRankings(userId) {
    return db(this.tableName)
      .join('games', 'high_scores.game_id', 'games.id')
      .where({ user_id: userId })
      .select(
        'high_scores.score',
        'high_scores.time_elapsed',
        'high_scores.updated_at',
        'games.id as game_id',
        'games.name as game_name',
        'games.slug as game_slug'
      )
      .orderBy('games.display_order', 'asc');
  },

  // Get user rank in a game
  async getUserRank(userId, gameId) {
    const userScore = await db(this.tableName)
      .where({ user_id: userId, game_id: gameId })
      .first();
    
    if (!userScore) return null;

    const [{ count }] = await db(this.tableName)
      .where({ game_id: gameId })
      .where('score', '>', userScore.score)
      .count();
    
    return {
      rank: parseInt(count) + 1,
      score: userScore.score,
    };
  },
};

module.exports = HighScore;
