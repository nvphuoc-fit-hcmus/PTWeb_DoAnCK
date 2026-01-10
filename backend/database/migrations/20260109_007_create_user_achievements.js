exports.up = function (knex) {
  return knex.schema.createTable("user_achievements", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .uuid("achievement_id")
      .notNullable()
      .references("id")
      .inTable("achievements")
      .onDelete("CASCADE");
    table.timestamp("unlocked_at").defaultTo(knex.fn.now());

    table.unique(["user_id", "achievement_id"]);

    table.index("user_id");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user_achievements");
};
