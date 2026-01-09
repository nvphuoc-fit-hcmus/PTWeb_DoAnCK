/**
 * Seed: Tạo friendships và sample data demo
 */
exports.seed = async function(knex) {
  // Tạo friendships giữa các users
  await knex('friendships').insert([
    {
      requester_id: '22222222-2222-2222-2222-222222222222', // player1
      addressee_id: '33333333-3333-3333-3333-333333333333', // player2
      status: 'accepted',
    },
    {
      requester_id: '22222222-2222-2222-2222-222222222222', // player1
      addressee_id: '44444444-4444-4444-4444-444444444444', // player3
      status: 'accepted',
    },
    {
      requester_id: '33333333-3333-3333-3333-333333333333', // player2
      addressee_id: '55555555-5555-5555-5555-555555555555', // gamer_pro
      status: 'pending',
    },
    {
      requester_id: '55555555-5555-5555-5555-555555555555', // gamer_pro
      addressee_id: '44444444-4444-4444-4444-444444444444', // player3
      status: 'accepted',
    },
  ]);

  // Tạo messages demo
  await knex('messages').insert([
    {
      sender_id: '22222222-2222-2222-2222-222222222222',
      receiver_id: '33333333-3333-3333-3333-333333333333',
      content: 'Chao ban! Choi Caro khong?',
      is_read: true,
    },
    {
      sender_id: '33333333-3333-3333-3333-333333333333',
      receiver_id: '22222222-2222-2222-2222-222222222222',
      content: 'OK! Choi luon nhe!',
      is_read: true,
    },
    {
      sender_id: '22222222-2222-2222-2222-222222222222',
      receiver_id: '33333333-3333-3333-3333-333333333333',
      content: 'Minh vua thang bot roi, diem cao lam!',
      is_read: false,
    },
    {
      sender_id: '55555555-5555-5555-5555-555555555555',
      receiver_id: '44444444-4444-4444-4444-444444444444',
      content: 'Ban oi, minh dat top 1 Snake roi!',
      is_read: false,
    },
  ]);

  // Tạo game sessions demo
  await knex('game_sessions').insert([
    {
      user_id: '22222222-2222-2222-2222-222222222222',
      game_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', // Caro 5
      score: 100,
      status: 'won',
      time_elapsed: 180,
      moves_count: 25,
    },
    {
      user_id: '33333333-3333-3333-3333-333333333333',
      game_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', // Snake
      score: 150,
      status: 'lost',
      time_elapsed: 120,
    },
    {
      user_id: '55555555-5555-5555-5555-555555555555',
      game_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', // Snake
      score: 350,
      status: 'lost',
      time_elapsed: 300,
    },
    {
      user_id: '44444444-4444-4444-4444-444444444444',
      game_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', // Memory
      score: 800,
      status: 'won',
      time_elapsed: 45,
    },
  ]);

  // Tạo high scores
  await knex('high_scores').insert([
    {
      user_id: '22222222-2222-2222-2222-222222222222',
      game_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      score: 100,
      time_elapsed: 180,
    },
    {
      user_id: '33333333-3333-3333-3333-333333333333',
      game_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      score: 150,
      time_elapsed: 120,
    },
    {
      user_id: '55555555-5555-5555-5555-555555555555',
      game_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      score: 350,
      time_elapsed: 300,
    },
    {
      user_id: '44444444-4444-4444-4444-444444444444',
      game_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      score: 800,
      time_elapsed: 45,
    },
  ]);

  // Tạo user achievements
  await knex('user_achievements').insert([
    {
      user_id: '22222222-2222-2222-2222-222222222222',
      achievement_id: 'a0000001-0000-0000-0000-000000000001', // Nguoi Moi
    },
    {
      user_id: '22222222-2222-2222-2222-222222222222',
      achievement_id: 'a0000004-0000-0000-0000-000000000004', // Chien Thang Dau Tien
    },
    {
      user_id: '55555555-5555-5555-5555-555555555555',
      achievement_id: 'a0000001-0000-0000-0000-000000000001', // Nguoi Moi
    },
    {
      user_id: '55555555-5555-5555-5555-555555555555',
      achievement_id: 'a0000006-0000-0000-0000-000000000006', // Ran Nho
    },
    {
      user_id: '55555555-5555-5555-5555-555555555555',
      achievement_id: 'a0000007-0000-0000-0000-000000000007', // Ran Khong Lo
    },
  ]);

  console.log('✅ Seeded sample data successfully!');
};
