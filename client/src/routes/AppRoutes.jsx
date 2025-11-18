



// routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";

// Pages
import AuthPage from "../pages/authPage/AuthPage";
import NewsPage from "../pages/newsPage/NewsPage";
import BookmarkPage from "../pages/bookmarkPage/BookmarkPage";
import ReadingHistoryPage from "../pages/historyPage/ReadingHistoryPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import SettingsPage from "../pages/settingsPage/SettingsPage";


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/news" element={<NewsPage />} />
        <Route path="/bookmarks" element={<BookmarkPage />} />
        <Route path="/history" element={<ReadingHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/news" />} />


    </Routes>
  );
};

export default AppRoutes;