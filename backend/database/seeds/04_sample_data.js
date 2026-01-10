exports.seed = async function (knex) {
  await knex("friendships").insert([
    {
      requester_id: "22222222-2222-2222-2222-222222222222",
      addressee_id: "33333333-3333-3333-3333-333333333333",
      status: "accepted",
    },
    {
      requester_id: "22222222-2222-2222-2222-222222222222",
      addressee_id: "44444444-4444-4444-4444-444444444444",
      status: "accepted",
    },
    {
      requester_id: "33333333-3333-3333-3333-333333333333",
      addressee_id: "55555555-5555-5555-5555-555555555555",
      status: "pending",
    },
    {
      requester_id: "55555555-5555-5555-5555-555555555555",
      addressee_id: "44444444-4444-4444-4444-444444444444",
      status: "accepted",
    },
  ]);

  await knex("messages").insert([
    {
      sender_id: "22222222-2222-2222-2222-222222222222",
      receiver_id: "33333333-3333-3333-3333-333333333333",
      content: "Chào bạn! Mình muốn chơi Caro 5 cùng bạn.",
      is_read: true,
    },
    {
      sender_id: "33333333-3333-3333-3333-333333333333",
      receiver_id: "22222222-2222-2222-2222-222222222222",
      content: "OK! Chơi luôn nhé!",
      is_read: true,
    },
    {
      sender_id: "22222222-2222-2222-2222-222222222222",
      receiver_id: "33333333-3333-3333-3333-333333333333",
      content: "Mình vừa thắng rồi đó!",
      is_read: false,
    },
    {
      sender_id: "55555555-5555-5555-5555-555555555555",
      receiver_id: "44444444-4444-4444-4444-444444444444",
      content: "Bạn ơi, mình đạt top 1 Snake rồi!",
      is_read: false,
    },
  ]);

  await knex("game_sessions").insert([
    {
      user_id: "22222222-2222-2222-2222-222222222222",
      game_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      score: 100,
      status: "won",
      time_elapsed: 180,
      moves_count: 25,
    },
    {
      user_id: "33333333-3333-3333-3333-333333333333",
      game_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      score: 150,
      status: "lost",
      time_elapsed: 120,
    },
    {
      user_id: "55555555-5555-5555-5555-555555555555",
      game_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      score: 350,
      status: "lost",
      time_elapsed: 300,
    },
    {
      user_id: "44444444-4444-4444-4444-444444444444",
      game_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
      score: 800,
      status: "won",
      time_elapsed: 45,
    },
  ]);

  await knex("high_scores").insert([
    {
      user_id: "22222222-2222-2222-2222-222222222222",
      game_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      score: 100,
      time_elapsed: 180,
    },
    {
      user_id: "33333333-3333-3333-3333-333333333333",
      game_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      score: 150,
      time_elapsed: 120,
    },
    {
      user_id: "55555555-5555-5555-5555-555555555555",
      game_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      score: 350,
      time_elapsed: 300,
    },
    {
      user_id: "44444444-4444-4444-4444-444444444444",
      game_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
      score: 800,
      time_elapsed: 45,
    },
  ]);

  await knex("user_achievements").insert([
    {
      user_id: "22222222-2222-2222-2222-222222222222",
      achievement_id: "a0000001-0000-0000-0000-000000000001",
    },
    {
      user_id: "22222222-2222-2222-2222-222222222222",
      achievement_id: "a0000004-0000-0000-0000-000000000004",
    },
    {
      user_id: "55555555-5555-5555-5555-555555555555",
      achievement_id: "a0000001-0000-0000-0000-000000000001",
    },
    {
      user_id: "55555555-5555-5555-5555-555555555555",
      achievement_id: "a0000006-0000-0000-0000-000000000006",
    },
    {
      user_id: "55555555-5555-5555-5555-555555555555",
      achievement_id: "a0000007-0000-0000-0000-000000000007",
    },
  ]);

  console.log("✅ Seeded sample data successfully!");
};
