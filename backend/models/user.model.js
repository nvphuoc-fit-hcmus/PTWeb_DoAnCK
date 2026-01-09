const db = require('../database/db');
const bcrypt = require('bcryptjs');

const User = {
  tableName: 'users',

  // Find user by ID
  async findById(id) {
    return db(this.tableName).where({ id }).first();
  },

  // Find user by username
  async findByUsername(username) {
    return db(this.tableName).where({ username }).first();
  },

  // Find user by email
  async findByEmail(email) {
    return db(this.tableName).where({ email }).first();
  },

  // Create new user
  async create(userData) {
    const { username, email, password, display_name } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    
    const [user] = await db(this.tableName)
      .insert({
        username,
        email,
        password_hash,
        display_name: display_name || username,
      })
      .returning(['id', 'username', 'email', 'display_name', 'role', 'created_at']);
    
    return user;
  },

  // Verify password
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  },

  // Update user
  async update(id, data) {
    const [user] = await db(this.tableName)
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning(['id', 'username', 'email', 'display_name', 'role', 'avatar_config', 'bio', 'is_active']);
    
    return user;
  },

  // Update last login
  async updateLastLogin(id) {
    return db(this.tableName)
      .where({ id })
      .update({ last_login: db.fn.now() });
  },

  // Get all users (admin)
  async findAll(options = {}) {
    const { page = 1, limit = 20, search = '' } = options;
    const offset = (page - 1) * limit;
    
    let query = db(this.tableName)
      .select('id', 'username', 'email', 'display_name', 'role', 'is_active', 'created_at', 'last_login');
    
    if (search) {
      query = query.where((builder) => {
        builder
          .where('username', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`)
          .orWhere('display_name', 'ilike', `%${search}%`);
      });
    }
    
    const users = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);
    const [{ count }] = await db(this.tableName).count();
    
    return { users, total: parseInt(count), page, limit };
  },

  // Delete user
  async delete(id) {
    return db(this.tableName).where({ id }).del();
  },

  // Get user profile with stats
  async getProfile(id) {
    const user = await this.findById(id);
    if (!user) return null;

    // Get game stats
    const stats = await db('game_sessions')
      .where({ user_id: id })
      .select(
        db.raw('COUNT(*) as total_games'),
        db.raw("COUNT(*) FILTER (WHERE status = 'won') as wins"),
        db.raw("COUNT(*) FILTER (WHERE status = 'lost') as losses"),
        db.raw('COALESCE(SUM(score), 0) as total_score')
      )
      .first();

    // Get achievements count
    const [{ count: achievementCount }] = await db('user_achievements')
      .where({ user_id: id })
      .count();

    // Get friends count
    const [{ count: friendsCount }] = await db('friendships')
      .where(function() {
        this.where({ requester_id: id, status: 'accepted' })
          .orWhere({ addressee_id: id, status: 'accepted' });
      })
      .count();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      avatar_config: user.avatar_config,
      bio: user.bio,
      role: user.role,
      created_at: user.created_at,
      stats: {
        total_games: parseInt(stats.total_games),
        wins: parseInt(stats.wins),
        losses: parseInt(stats.losses),
        total_score: parseInt(stats.total_score),
        achievements: parseInt(achievementCount),
        friends: parseInt(friendsCount),
      },
    };
  },
};

module.exports = User;
