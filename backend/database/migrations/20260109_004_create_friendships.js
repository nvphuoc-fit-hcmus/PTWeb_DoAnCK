exports.up = function (knex) {
  return knex.schema.createTable("friendships", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("requester_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .uuid("addressee_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .enum("status", ["pending", "accepted", "rejected", "blocked"])
      .defaultTo("pending");
    table.timestamps(true, true);

    table.unique(["requester_id", "addressee_id"]);

    table.index(["requester_id", "status"]);
    table.index(["addressee_id", "status"]);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("friendships");
};
