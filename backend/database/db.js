require("dotenv").config();
const knex = require("knex");
const config = require("../knexfile");

const environment = process.env.NODE_ENV || "development";
const dbConfig = config[environment];

if (dbConfig.connection) {
  dbConfig.connection.ssl = { rejectUnauthorized: false };
}

const db = knex(dbConfig);

db.raw("SELECT 1")
  .then(() => {
    console.log("✅ Database connected successfully (PostgreSQL/Supabase)");
  })
  .catch((err) => {
    console.error("❌ Database connection failed. Server will stop.");
    console.error("Lỗi chi tiết:", err.message);
  });

module.exports = db;
