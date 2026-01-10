exports.up = function (knex) {
  return knex.schema.createTable("games", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("name", 50).notNullable().unique();
    table.string("slug", 50).notNullable().unique();
    table.text("description");
    table.text("config");
    table.text("icon_matrix");
    table.boolean("is_active").defaultTo(true);
    table.integer("default_time_limit").defaultTo(300);
    table.integer("display_order").defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("games");
};
