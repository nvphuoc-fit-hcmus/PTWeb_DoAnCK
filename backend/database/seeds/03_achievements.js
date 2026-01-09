/**
 * Seed: Tạo achievements demo
 */
exports.seed = async function(knex) {
  // Xóa dữ liệu cũ
  await knex('achievements').del();

  await knex('achievements').insert([
    // Global achievements
    {
      id: 'a0000001-0000-0000-0000-000000000001',
      name: 'Nguoi Moi',
      slug: 'newcomer',
      description: 'Choi game dau tien',
      condition_type: 'games_played',
      condition_value: 1,
      game_id: null,
      points: 10,
    },
    {
      id: 'a0000002-0000-0000-0000-000000000002',
      name: 'Nguoi Choi Cham Chi',
      slug: 'dedicated-player',
      description: 'Choi 10 game',
      condition_type: 'games_played',
      condition_value: 10,
      game_id: null,
      points: 25,
    },
    {
      id: 'a0000003-0000-0000-0000-000000000003',
      name: 'Game Thu',
      slug: 'gamer',
      description: 'Choi 50 game',
      condition_type: 'games_played',
      condition_value: 50,
      game_id: null,
      points: 50,
    },
    {
      id: 'a0000004-0000-0000-0000-000000000004',
      name: 'Chien Thang Dau Tien',
      slug: 'first-win',
      description: 'Thang game dau tien',
      condition_type: 'wins',
      condition_value: 1,
      game_id: null,
      points: 15,
    },
    {
      id: 'a0000005-0000-0000-0000-000000000005',
      name: 'Nguoi Chien Thang',
      slug: 'winner',
      description: 'Thang 10 game',
      condition_type: 'wins',
      condition_value: 10,
      game_id: null,
      points: 30,
    },

    // Snake achievements
    {
      id: 'a0000006-0000-0000-0000-000000000006',
      name: 'Ran Nho',
      slug: 'small-snake',
      description: 'Dat 50 diem trong Snake',
      condition_type: 'score',
      condition_value: 50,
      game_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      points: 15,
    },
    {
      id: 'a0000007-0000-0000-0000-000000000007',
      name: 'Ran Khong Lo',
      slug: 'giant-snake',
      description: 'Dat 200 diem trong Snake',
      condition_type: 'score',
      condition_value: 200,
      game_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      points: 50,
    },

    // Caro achievements
    {
      id: 'a0000008-0000-0000-0000-000000000008',
      name: 'Cao Thu Caro',
      slug: 'caro-master',
      description: 'Thang 5 game Caro 5',
      condition_type: 'wins',
      condition_value: 5,
      game_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      points: 40,
    },

    // Memory achievements
    {
      id: 'a0000009-0000-0000-0000-000000000009',
      name: 'Tri Nho Sieu Pham',
      slug: 'super-memory',
      description: 'Hoan thanh Memory duoi 60 giay',
      condition_type: 'time',
      condition_value: 60,
      game_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      points: 35,
    },

    // Match-3 achievements
    {
      id: 'a0000010-0000-0000-0000-000000000010',
      name: 'Combo Master',
      slug: 'combo-master',
      description: 'Dat 500 diem trong Match-3',
      condition_type: 'score',
      condition_value: 500,
      game_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      points: 45,
    },
  ]);

  console.log('✅ Seeded achievements successfully!');
};
