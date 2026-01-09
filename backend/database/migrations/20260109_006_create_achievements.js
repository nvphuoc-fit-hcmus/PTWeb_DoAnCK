/**
 * Migration: Create achievements table
 */
exports.up = function(knex) {
  return knex.schema.createTable('achievements', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable().unique();
    table.string('slug', 100).notNullable().unique();
    table.text('description');
    table.text('icon_matrix'); // JSON: pixel art icon
    table.string('condition_type', 50); // 'score', 'games_played', 'wins', 'streak', etc.
    table.integer('condition_value'); // threshold value
    table.uuid('game_id').references('id').inTable('games').onDelete('SET NULL'); // null = global achievement
    table.integer('points').defaultTo(10); // achievement points
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('achievements');
};
