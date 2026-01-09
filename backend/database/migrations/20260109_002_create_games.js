/**
 * Migration: Create games table
 */
exports.up = function(knex) {
  return knex.schema.createTable('games', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 50).notNullable().unique();
    table.string('slug', 50).notNullable().unique(); // URL-friendly name
    table.text('description');
    table.text('config'); // JSON: { boardSize: { rows: 20, cols: 20 }, winCondition: 5, ... }
    table.text('icon_matrix'); // JSON: pixel art icon for menu display
    table.boolean('is_active').defaultTo(true);
    table.integer('default_time_limit').defaultTo(300); // seconds
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('games');
};
