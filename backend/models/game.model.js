const db = require("../database/db");

const Game = {
  tableName: "games",

  async findById(id) {
    return db(this.tableName).where({ id }).first();
  },

  async findBySlug(slug) {
    return db(this.tableName).where({ slug }).first();
  },

  async findAllActive() {
    return db(this.tableName)
      .where({ is_active: true })
      .orderBy("display_order", "asc");
  },

  async findAll() {
    return db(this.tableName).orderBy("display_order", "asc");
  },

  async create(gameData) {
    const [game] = await db(this.tableName).insert(gameData).returning("*");

    return game;
  },

  async update(id, data) {
    const [game] = await db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");

    return game;
  },

  async toggleActive(id) {
    const game = await this.findById(id);
    if (!game) return null;

    return this.update(id, { is_active: !game.is_active });
  },

  async delete(id) {
    return db(this.tableName).where({ id }).del();
  },

  async getConfig(id) {
    const game = await this.findById(id);
    if (!game) return null;

    try {
      return JSON.parse(game.config);
    } catch {
      return {};
    }
  },

  async updateConfig(id, config) {
    return this.update(id, { config: JSON.stringify(config) });
  },
};

module.exports = Game;
