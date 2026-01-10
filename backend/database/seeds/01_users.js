const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  await knex("user_achievements").del();
  await knex("high_scores").del();
  await knex("game_sessions").del();
  await knex("messages").del();
  await knex("friendships").del();
  await knex("users").del();

  const passwordHash = await bcrypt.hash("123456", 10);

  await knex("users").insert([
    {
      id: "11111111-1111-1111-1111-111111111111",
      username: "admin",
      email: "admin@boardgame.com",
      password_hash: passwordHash,
      role: "admin",
      display_name: "Administrator",
      bio: "Quản trị viên hệ thống Board Game",
      is_active: true,
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      username: "player1",
      email: "player1@gmail.com",
      password_hash: passwordHash,
      role: "user",
      display_name: "Nguoi Choi 1",
      bio: "Tôi thich choi Caro!",
      is_active: true,
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      username: "player2",
      email: "player2@gmail.com",
      password_hash: passwordHash,
      role: "user",
      display_name: "Nguoi Choi 2",
      bio: "Snake là trò chơi yêu thích của tôi",
      is_active: true,
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      username: "player3",
      email: "player3@gmail.com",
      password_hash: passwordHash,
      role: "user",
      display_name: "Nguoi Choi 3",
      bio: "Thích chơi Memory game",
      is_active: true,
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      username: "gamer_pro",
      email: "gamerpro@gmail.com",
      password_hash: passwordHash,
      role: "user",
      display_name: "Pro Gamer",
      bio: "Top 1 mọi game!",
      is_active: true,
    },
  ]);

  console.log("✅ Seeded users successfully!");
};
