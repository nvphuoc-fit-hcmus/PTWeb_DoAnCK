exports.up = function (knex) {
  return knex.schema.createTable("game_reviews", (table) => {
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
    table.integer("rating").notNullable().checkBetween([1, 5]); // 1-5 stars
    table.text("comment");
    table.timestamps(true, true);

    // Mỗi user chỉ có thể review 1 lần trên mỗi game
    table.unique(["user_id", "game_id"]);

    table.index(["game_id", "rating"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("game_reviews");
};
