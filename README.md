# 🎮 Board Game Platform - Đồ án Phát triển Web

## Mô tả dự án
Ứng dụng web Board Game với giao diện ma trận LED điều khiển bằng 5 nút (Left, Right, Enter, Back, Hint).

## Công nghệ sử dụng
- **Frontend**: React + Vite
- **Backend**: Express.js + Knex + Supabase
- **Database**: PostgreSQL (Supabase)

## Các game có trong hệ thống
- Caro hàng 5
- Caro hàng 4  
- Tic-tac-toe
- Rắn săn mồi (Snake)
- Ghép hàng 3 (Match-3)
- Cờ trí nhớ (Memory)
- Bảng vẽ tự do (Free Draw)

## Cấu trúc thư mục
```
Do_An/
├── backend/          # Express.js API server
│   ├── controllers/  # Xử lý logic
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth, validation
│   └── database/     # Migrations & Seeds
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── contexts/
│   └── public/
└── README.md
```

## Hướng dẫn cài đặt

### Backend
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tác giả
- Sinh viên: [Tên sinh viên]
- MSSV: [Mã số sinh viên]
- Môn học: Phát triển ứng dụng Web
