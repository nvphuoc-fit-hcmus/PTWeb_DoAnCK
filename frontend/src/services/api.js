import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.put("/auth/password", data),
};

export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put("/users/profile", data),
  searchUsers: (query) => api.get("/users/search", { params: { q: query } }),
};

export const gameAPI = {
  getGames: () => api.get("/games"),
  getGame: (slug) => api.get(`/games/${slug}`),
  startGame: (gameId, config) =>
    api.post("/games/start", { game_id: gameId, config }),
  saveGame: (sessionId, state, score, timeElapsed) =>
    api.post("/games/save", {
      session_id: sessionId,
      state,
      score,
      time_elapsed: timeElapsed,
    }),
  loadGame: (sessionId) => api.get(`/games/load/${sessionId}`),
  getSavedGames: () => api.get("/games/saved"),
  finishGame: (sessionId, status, score, timeElapsed) =>
    api.post("/games/finish", {
      session_id: sessionId,
      status,
      score,
      time_elapsed: timeElapsed,
    }),
  getRankings: (gameId, type = "global") =>
    api.get(`/games/rankings/${gameId}`, { params: { type } }),
};

export const friendAPI = {
  getFriends: () => api.get("/friends"),
  getFriendRequests: () => api.get("/friends/pending"),
  sendFriendRequest: (userId) =>
    api.post("/friends/request", { addressee_id: userId }),
  acceptFriendRequest: (requestId) =>
    api.put(`/friends/respond/${requestId}`, { action: "accept" }),
  rejectFriendRequest: (requestId) =>
    api.put(`/friends/respond/${requestId}`, { action: "reject" }),
  removeFriend: (userId) => api.delete(`/friends/${userId}`),
};

export const messageAPI = {
  getConversations: () => api.get("/messages"),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (data) => api.post("/messages", data),
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  getUnreadCount: () => api.get("/messages/unread/count"),
};

export const achievementAPI = {
  getAll: () => api.get("/achievements"),
  getMyAchievements: () => api.get("/achievements/me"),
  getUserAchievements: (userId) => api.get(`/achievements/user/${userId}`),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getGames: () => api.get("/admin/games"),
  updateGame: (gameId, data) => api.put(`/admin/games/${gameId}`, data),
};

export default api;
