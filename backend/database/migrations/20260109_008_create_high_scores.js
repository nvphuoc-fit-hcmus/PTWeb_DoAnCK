/**
 * Migration: Create high_scores table for rankings
 */
exports.up = function(knex) {
  return knex.schema.createTable('high_scores', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.integer('score').notNullable();
    table.integer('time_elapsed'); // for time-based rankings
    table.uuid('session_id').references('id').inTable('game_sessions').onDelete('SET NULL');
    table.timestamps(true, true);
    
    // Each user has one high score per game
    table.unique(['user_id', 'game_id']);
    
    // Index for ranking queries
    table.index(['game_id', 'score']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('high_scores');
};
