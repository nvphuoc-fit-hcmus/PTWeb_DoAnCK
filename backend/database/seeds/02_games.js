/**
 * Seed: Tạo games demo
 */
exports.seed = async function(knex) {
  // Xóa dữ liệu cũ
  await knex('games').del();

  // Tạo games
  await knex('games').insert([
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      name: 'Caro 5',
      slug: 'caro-5',
      description: 'Game Caro truyen thong - Xep 5 quan lien tiep de thang',
      config: JSON.stringify({
        boardSize: { rows: 15, cols: 15 },
        winCondition: 5,
        playerColor: '#3B82F6', // Blue
        computerColor: '#EF4444', // Red
      }),
      is_active: true,
      default_time_limit: 600,
      display_order: 1,
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Caro 4',
      slug: 'caro-4',
      description: 'Game Caro - Xep 4 quan lien tiep de thang',
      config: JSON.stringify({
        boardSize: { rows: 10, cols: 10 },
        winCondition: 4,
        playerColor: '#3B82F6',
        computerColor: '#EF4444',
      }),
      is_active: true,
      default_time_limit: 300,
      display_order: 2,
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      name: 'Tic-Tac-Toe',
      slug: 'tic-tac-toe',
      description: 'Game co dien 3x3 - Xep 3 quan de thang',
      config: JSON.stringify({
        boardSize: { rows: 3, cols: 3 },
        winCondition: 3,
        playerColor: '#3B82F6',
        computerColor: '#EF4444',
      }),
      is_active: true,
      default_time_limit: 120,
      display_order: 3,
    },
    {
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      name: 'Snake',
      slug: 'snake',
      description: 'Ran san moi - Dieu khien ran an moi va lon len',
      config: JSON.stringify({
        boardSize: { rows: 20, cols: 20 },
        initialSpeed: 200, // ms per move
        speedIncrease: 5, // ms faster per food eaten
        initialLength: 3,
        snakeColor: '#22C55E', // Green
        foodColor: '#EF4444', // Red
      }),
      is_active: true,
      default_time_limit: 0, // No time limit
      display_order: 4,
    },
    {
      id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
      name: 'Match-3',
      slug: 'match-3',
      description: 'Ghep 3 vien cung mau - Tuong tu Candy Crush',
      config: JSON.stringify({
        boardSize: { rows: 8, cols: 8 },
        colors: ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'],
        matchCount: 3,
        moveLimit: 30,
      }),
      is_active: true,
      default_time_limit: 180,
      display_order: 5,
    },
    {
      id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      name: 'Memory',
      slug: 'memory',
      description: 'Co tri nho - Lat va ghep cap the giong nhau',
      config: JSON.stringify({
        boardSize: { rows: 4, cols: 4 },
        colors: ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'],
        flipDelay: 1000, // ms before cards flip back
      }),
      is_active: true,
      default_time_limit: 120,
      display_order: 6,
    },
    {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Free Draw',
      slug: 'free-draw',
      description: 'Bang ve tu do - Sang tao nghe thuat pixel',
      config: JSON.stringify({
        boardSize: { rows: 20, cols: 20 },
        colors: [
          '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
          '#22C55E', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
          '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
          '#F43F5E', '#FFFFFF', '#000000', '#6B7280', '#D1D5DB',
        ],
        defaultColor: '#FFFFFF',
      }),
      is_active: true,
      default_time_limit: 0, // No time limit
      display_order: 7,
    },
  ]);

  console.log('✅ Seeded games successfully!');
};
