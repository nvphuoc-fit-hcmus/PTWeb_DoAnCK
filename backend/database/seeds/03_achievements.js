exports.seed = async function (knex) {
  await knex("achievements").del();

  await knex("achievements").insert([
    {
      id: "a0000001-0000-0000-0000-000000000001",
      name: "Người Mới",
      slug: "newcomer",
      description: "Chơi game lần đầu tiên",
      condition_type: "games_played",
      condition_value: 1,
      game_id: null,
      points: 10,
    },
    {
      id: "a0000002-0000-0000-0000-000000000002",
      name: "Người Chơi Chăm Chỉ",
      slug: "dedicated-player",
      description: "Chơi 10 game",
      condition_type: "games_played",
      condition_value: 10,
      game_id: null,
      points: 25,
    },
    {
      id: "a0000003-0000-0000-0000-000000000003",
      name: "Game Thủ",
      slug: "gamer",
      description: "Chơi 50 game",
      condition_type: "games_played",
      condition_value: 50,
      game_id: null,
      points: 50,
    },
    {
      id: "a0000004-0000-0000-0000-000000000004",
      name: "Chiến Thắng Đầu Tiên",
      slug: "first-win",
      description: "Thắng game đầu tiên",
      condition_type: "wins",
      condition_value: 1,
      game_id: null,
      points: 15,
    },
    {
      id: "a0000005-0000-0000-0000-000000000005",
      name: "Người Chiến Thắng",
      slug: "winner",
      description: "Thắng 10 game",
      condition_type: "wins",
      condition_value: 10,
      game_id: null,
      points: 30,
    },

    {
      id: "a0000006-0000-0000-0000-000000000006",
      name: "Rắn Nhỏ",
      slug: "small-snake",
      description: "Đạt 50 điểm trong Snake",
      condition_type: "score",
      condition_value: 50,
      game_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      points: 15,
    },
    {
      id: "a0000007-0000-0000-0000-000000000007",
      name: "Rắn Khủng",
      slug: "giant-snake",
      description: "Đạt 200 điểm trong Snake",
      condition_type: "score",
      condition_value: 200,
      game_id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      points: 50,
    },

    {
      id: "a0000008-0000-0000-0000-000000000008",
      name: "Cao Thủ Caro",
      slug: "caro-master",
      description: "Thắng 5 game Caro 5",
      condition_type: "wins",
      condition_value: 5,
      game_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      points: 40,
    },

    {
      id: "a0000009-0000-0000-0000-000000000009",
      name: "Trí Nhớ Siêu Phàm",
      slug: "super-memory",
      description: "Hoàn thành Memory dưới 60 giây",
      condition_type: "time",
      condition_value: 60,
      game_id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
      points: 35,
    },

    {
      id: "a0000010-0000-0000-0000-000000000010",
      name: "Combo Master",
      slug: "combo-master",
      description: "Đạt 500 điểm trong Match-3",
      condition_type: "score",
      condition_value: 500,
      game_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      points: 45,
    },
  ]);

  console.log("✅ Seeded achievements successfully!");
};
