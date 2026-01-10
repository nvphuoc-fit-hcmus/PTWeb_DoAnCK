exports.up = function (knex) {
  return knex.schema.createTable("achievements", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name", 100).notNullable().unique();
    table.string("slug", 100).notNullable().unique();
    table.text("description");
    table.text("icon_matrix");
    table.string("condition_type", 50);
    table.integer("condition_value");
    table
      .uuid("game_id")
      .references("id")
      .inTable("games")
      .onDelete("SET NULL");
    table.integer("points").defaultTo(10);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("achievements");
};
