const db = require('../database/db');

const Game = {
  tableName: 'games',

  // Find game by ID
  async findById(id) {
    return db(this.tableName).where({ id }).first();
  },

  // Find game by slug
  async findBySlug(slug) {
    return db(this.tableName).where({ slug }).first();
  },

  // Get all active games
  async findAllActive() {
    return db(this.tableName)
      .where({ is_active: true })
      .orderBy('display_order', 'asc');
  },

  // Get all games (admin)
  async findAll() {
    return db(this.tableName).orderBy('display_order', 'asc');
  },

  // Create new game
  async create(gameData) {
    const [game] = await db(this.tableName)
      .insert(gameData)
      .returning('*');
    
    return game;
  },

  // Update game
  async update(id, data) {
    const [game] = await db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    
    return game;
  },

  // Toggle game active status
  async toggleActive(id) {
    const game = await this.findById(id);
    if (!game) return null;
    
    return this.update(id, { is_active: !game.is_active });
  },

  // Delete game
  async delete(id) {
    return db(this.tableName).where({ id }).del();
  },

  // Get game config
  async getConfig(id) {
    const game = await this.findById(id);
    if (!game) return null;
    
    try {
      return JSON.parse(game.config);
    } catch {
      return {};
    }
  },

  // Update game config
  async updateConfig(id, config) {
    return this.update(id, { config: JSON.stringify(config) });
  },
};

module.exports = Game;
