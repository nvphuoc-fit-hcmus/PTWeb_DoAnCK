const db = require("../database/db");

const GameSession = {
  tableName: "game_sessions",

  async findById(id) {
    return db(this.tableName).where({ id }).first();
  },

  async findByUserId(userId, options = {}) {
    const { gameId, status, limit = 20, offset = 0 } = options;

    let query = db(this.tableName)
      .where({ user_id: userId })
      .orderBy("updated_at", "desc");

    if (gameId) query = query.where({ game_id: gameId });
    if (status) query = query.where({ status });

    return query.limit(limit).offset(offset);
  },

  async create(sessionData) {
    const [session] = await db(this.tableName)
      .insert(sessionData)
      .returning("*");

    return session;
  },

  async update(id, data) {
    const [session] = await db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");

    return session;
  },

  async saveState(id, state, score, timeElapsed) {
    return this.update(id, {
      state: JSON.stringify(state),
      score,
      time_elapsed: timeElapsed,
      status: "saved",
    });
  },

  async loadState(id) {
    const session = await this.findById(id);
    if (!session) return null;

    try {
      return {
        ...session,
        state: JSON.parse(session.state),
        config: JSON.parse(session.config || "{}"),
      };
    } catch {
      return session;
    }
  },

  async getSavedGames(userId) {
    return db(this.tableName)
      .join("games", "game_sessions.game_id", "games.id")
      .where({ user_id: userId, "game_sessions.status": "saved" })
      .select(
        "game_sessions.id",
        "game_sessions.score",
        "game_sessions.time_elapsed",
        "game_sessions.updated_at",
        "games.name as game_name",
        "games.slug as game_slug"
      )
      .orderBy("game_sessions.updated_at", "desc");
  },

  async finish(id, status, finalScore) {
    return this.update(id, {
      status,
      score: finalScore,
    });
  },

  async delete(id) {
    return db(this.tableName).where({ id }).del();
  },
};

module.exports = GameSession;
