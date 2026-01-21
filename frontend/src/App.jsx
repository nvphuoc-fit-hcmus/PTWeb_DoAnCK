import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Layouts
import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages - Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Pages - Client
import Home from "./pages/client/Home";
import GameSelect from "./pages/client/GameSelect";
import Profile from "./pages/client/Profile";
import FriendManagement from "./pages/client/FriendManagement";
import MessageManagement from "./pages/client/MessageManagement";
import Ranking from "./pages/client/Ranking";

// Pages - Games
import {
  Match3Game,
  MemoryGame,
  FreeDrawGame,
  Caro5Game,
  Caro4Game,
  TicTacToeGame,
  SnakeGame,
} from "./pages/games";

// Pages - Admin
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import GameManagement from "./pages/admin/GameManagement";
import Statistics from "./pages/admin/Statistics";

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Dang tai...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<GameSelect />} />
        <Route path="/games/match3" element={<Match3Game />} />
        <Route path="/games/memory" element={<MemoryGame />} />
        <Route path="/games/freedraw" element={<FreeDrawGame />} />
        <Route path="/games/caro5" element={<Caro5Game />} />
        <Route path="/games/caro4" element={<Caro4Game />} />
        <Route path="/games/tictactoe" element={<TicTacToeGame />} />
        <Route path="/games/snake" element={<SnakeGame />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessageManagement />
            </ProtectedRoute>
          }
        />
        <Route path="/ranking" element={<Ranking />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="games" element={<GameManagement />} />
        <Route path="stats" element={<Statistics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
