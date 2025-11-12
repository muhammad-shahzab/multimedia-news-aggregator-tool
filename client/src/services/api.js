import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ──────────────────────────────────────────────
// Add token to requests
// ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ──────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
};

// ──────────────────────────────────────────────
// User API
// ──────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/profile", data),

  // -------------------- Topics --------------------
  toggleFavTopic: (topic) => api.post("/user/topic/toggle", { topic }),
  checkFavTopic: (topic) => api.get(`/user/topic/check?topic=${topic}`),

  // -------------------- Channels --------------------
  toggleFavChannel: (channel) => api.post("/user/channel/toggle", { channel }),
  checkFavChannel: (channel) => api.get(`/user/channel/check?channel=${channel}`),
};

// ──────────────────────────────────────────────
// News API
// ──────────────────────────────────────────────
export const newsAPI = {
  fetchPersonalizedArticles: () => api.get(`/rssfeed/personalized`),
  fetchFollowingArticles: () => api.get(`/rssfeed/following`),
  fetchArticlesLatest: () => api.get(`/rssfeed/latest`),
};

// ──────────────────────────────────────────────
// Channels API
// ──────────────────────────────────────────────
export const channelsAPI = {
  fetchChannels: () => api.get("/channels"),
 fetchNewsByChannel: (channelName) =>api.get(`/channels/channel/${channelName}`),
};

// ──────────────────────────────────────────────
// Bookmarks API
// ──────────────────────────────────────────────
export const bookmarksAPI = {
  getBookmarks: () => api.get("/bookmarks"),
  getBookmarkedArticles: () => api.get("/bookmarks/articles"),
  addBookmark: (articleData) => api.post("/bookmarks", articleData),
  removeBookmark: (bookmarkId) => api.delete(`/bookmarks/${bookmarkId}`),
};

// ──────────────────────────────────────────────
// History API
// ──────────────────────────────────────────────
export const historyAPI = {
  getHistory: (timeframe) => api.get(`/history?timeframe=${timeframe}`),
  addToHistory: (articleData) => api.post("/history", articleData),
  getStats: () => api.get("/history/stats"),
};



export default api;
