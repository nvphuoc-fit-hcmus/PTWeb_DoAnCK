const db = require("../database/db");

const Achievement = {
  tableName: "achievements",
  userAchievementsTable: "user_achievements",

  async findAll() {
    return db(this.tableName).orderBy("name", "asc");
  },

  async findById(id) {
    return db(this.tableName).where({ id }).first();
  },

  async getUserAchievements(userId) {
    return db(this.userAchievementsTable)
      .join(
        this.tableName,
        "user_achievements.achievement_id",
        "achievements.id"
      )
      .where({ user_id: userId })
      .select("achievements.*", "user_achievements.unlocked_at")
      .orderBy("user_achievements.unlocked_at", "desc");
  },

  async unlock(userId, achievementId) {
    const existing = await db(this.userAchievementsTable)
      .where({ user_id: userId, achievement_id: achievementId })
      .first();

    if (existing) return { already_unlocked: true, ...existing };

    const [userAchievement] = await db(this.userAchievementsTable)
      .insert({ user_id: userId, achievement_id: achievementId })
      .returning("*");

    return userAchievement;
  },

  async checkAndUnlock(userId, conditionType, value, gameId = null) {
    let query = db(this.tableName)
      .where({ condition_type: conditionType })
      .where("condition_value", "<=", value);

    if (gameId) {
      query = query.where(function () {
        this.where({ game_id: gameId }).orWhereNull("game_id");
      });
    } else {
      query = query.whereNull("game_id");
    }

    const achievements = await query;
    const unlocked = [];

    for (const achievement of achievements) {
      const result = await this.unlock(userId, achievement.id);
      if (!result.already_unlocked) {
        unlocked.push({ ...achievement, unlocked_at: result.unlocked_at });
      }
    }

    return unlocked;
  },

  async create(data) {
    const [achievement] = await db(this.tableName).insert(data).returning("*");

    return achievement;
  },

  async update(id, data) {
    const [achievement] = await db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");

    return achievement;
  },

  async delete(id) {
    return db(this.tableName).where({ id }).del();
  },
};

module.exports = Achievement;
