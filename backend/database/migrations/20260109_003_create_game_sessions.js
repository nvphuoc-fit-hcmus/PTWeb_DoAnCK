exports.up = function (knex) {
  return knex.schema.createTable("game_sessions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .uuid("game_id")
      .notNullable()
      .references("id")
      .inTable("games")
      .onDelete("CASCADE");
    table.text("state");
    table.integer("score").defaultTo(0);
    table
      .enum("status", ["playing", "won", "lost", "draw", "saved"])
      .defaultTo("playing");
    table.integer("time_elapsed").defaultTo(0);
    table.integer("time_limit");
    table.integer("moves_count").defaultTo(0);
    table.text("config");
    table.timestamps(true, true);

    table.index(["user_id", "game_id"]);
    table.index(["user_id", "status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("game_sessions");
};
