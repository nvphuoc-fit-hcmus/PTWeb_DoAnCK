exports.up = function (knex) {
  return knex.schema.createTable("messages", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("sender_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .uuid("receiver_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("content").notNullable();
    table.boolean("is_read").defaultTo(false);
    table.timestamp("read_at");
    table.timestamps(true, true);

    table.index(["sender_id", "receiver_id"]);
    table.index(["receiver_id", "is_read"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("messages");
};
