// components/layout/BottomNav.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { Home, Bookmark, History, Settings } from "@mui/icons-material";
import styles from "./BottomNav.module.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const routes = [
    { path: "/news", icon: <Home />, label: "Home" },
    { path: "/bookmarks", icon: <Bookmark />, label: "Bookmarks" },
    { path: "/history", icon: <History />, label: "History" },
    { path: "/settings", icon: <Settings />, label: "Settings" },
  ];

  const value = routes.findIndex(r => location.pathname === r.path);

  return (
    <Paper className={styles.nav} elevation={3}>
      <BottomNavigation
        value={value}
        onChange={(e, v) => navigate(routes[v].path)}
        showLabels
      >
        {routes.map((r) => (
          <BottomNavigationAction key={r.path} label={r.label} icon={r.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;