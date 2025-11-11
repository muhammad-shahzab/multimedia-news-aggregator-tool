
// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// // Pages
// import AuthPage from "../pages/AuthPage";
// import NewsPage from "../pages/NewsPage";
// import BookmarkPage from "../pages/BookmarkPage";
// import ReadingHistoryPage from "../pages/ReadingHistoryPage";
// import ProfilePage from "../pages/ProfilePage";
// import SettingsPage from "../pages/SettingsPage";

// // Route Protection Wrapper
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) return <div>Loading...</div>;

//   return isAuthenticated ? children : <Navigate to="/" />;
// };

// // App Routes
// const AppRoutes = () => {
//   const { isAuthenticated } = useAuth();

//   return (
//     <Routes>
//       <Route
//         path="/"
//         element={isAuthenticated ? <Navigate to="/news" /> : <AuthPage />}
//       />
//       <Route
//         path="/news"
//         element={
//           <ProtectedRoute>
//             <NewsPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/bookmarks"
//         element={
//           <ProtectedRoute>
//             <BookmarkPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/history"
//         element={
//           <ProtectedRoute>
//             <ReadingHistoryPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/profile"
//         element={
//           <ProtectedRoute>
//             <ProfilePage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/settings"
//         element={
//           <ProtectedRoute>
//             <SettingsPage />
//           </ProtectedRoute>
//         }
//       />
//     </Routes>
//   );
// };

// export default AppRoutes;



























// // import React from "react";
// // import { Routes, Route, Navigate } from "react-router-dom";
// // import { useAuth } from "../contexts/AuthContext";

// // // Pages
// // import AuthPage from "../components/AuthPage";
// // import NewsPage from "../components/NewsPage";
// // import BookmarkPage from "../components/BookmarkPage";
// // import ReadingHistoryPage from "../components/ReadingHistoryPage";

// // // Route Protection Wrapper
// // const ProtectedRoute = ({ children }) => {
// //   const { isAuthenticated, loading } = useAuth();

// //   if (loading) return <div>Loading...</div>;

// //   return isAuthenticated ? children : <Navigate to="/" />;
// // };

// // // App Routes
// // const AppRoutes = () => {
// //   const { isAuthenticated } = useAuth();

// //   return (
// //     <Routes>
// //       <Route
// //         path="/"
// //         element={isAuthenticated ? <Navigate to="/news" /> : <AuthPage />}
// //       />
// //       <Route
// //         path="/news"
// //         element={
// //           <ProtectedRoute>
// //             <NewsPage />
// //           </ProtectedRoute>
// //         }
// //       />
// //       <Route
// //         path="/bookmarks"
// //         element={
// //           <ProtectedRoute>
// //             <BookmarkPage />
// //           </ProtectedRoute>
// //         }
// //       />
// //       <Route
// //         path="/history"
// //         element={
// //           <ProtectedRoute>
// //             <ReadingHistoryPage />
// //           </ProtectedRoute>
// //         }
// //       />
// //     </Routes>
// //   );
// // };

// // export default AppRoutes;

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