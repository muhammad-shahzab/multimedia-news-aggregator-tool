
// components/layout/Header.jsx

import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  AppBar, Toolbar, Typography, 
  IconButton, Avatar, Menu, MenuItem, Box,
} from "@mui/material";
import {
   Bookmark, AccessTime, AccountCircle,
   Logout, Menu as MenuIcon, Home, Announcement, PlayCircleOutline
} from "@mui/icons-material";
import { useAuth } from "../../../context/AuthContext";
import { useDrawer } from "../../../context/DrawerContext";
import styles from "./Header.module.css";
import logoLight from "./lightLogo.png";
import { AlertsAPI } from "../../../services/api"



const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { setDrawerOpen } = useDrawer();
  const [anchorEl, setAnchorEl] = useState(null);

  const [alertsAnchorEl, setAlertsAnchorEl] = useState(null);
  const [alerts, setAlerts] = useState([]);




 const handleAlertsClick = async (event) => {
  setAlertsAnchorEl(event.currentTarget);
  try { setAlerts([]);
    const response = await AlertsAPI.fetchAlerts();

    // Ensure we always have an array
    const alertsArray = Array.isArray(response.data)
      ? response.data
      : Object.values(response.data);
    const validAlerts = alertsArray;
    setAlerts(validAlerts);
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
  }
};


  const handleAlertsClose = () => {
    setAlertsAnchorEl(null);
  };



  // Page titles (except /news)
  const pageTitles = {
    "/bookmarks": "Bookmarks",
    "/history": "Reading History",
    "/profile": "Profile",
    "/settings": "Settings",
  };

  const pageTitle = pageTitles[location.pathname] || null;


  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNavigate = (p) => {
    handleMenuClose();
    navigate(p);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    handleMenuClose();
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() ?? "U";

  return (
    <AppBar position="sticky" className={styles.appbar}>
      <Toolbar className={styles.toolbar}>


        {/* LEFT: Mobile Menu + Logo (Always visible) */}
        <Box className={styles.leftSection}>
          <div className={styles.menuIcon}>
            <IconButton edge="start" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          </div>

          {/* Logo - Always visible */}
          <Box className={styles.logo} onClick={() => navigate("/news")}>
            <img src={logoLight} alt="Persona Logo" className="auth-header-logo-img" />

            <Typography variant="h5" className={styles.logoText}>Persona</Typography>
          </Box>
        </Box>

        {/* CENTER: Page Title (only if not /news) */}
        {pageTitle && (
          <Typography variant="h6" className={styles.centerTitle}>
            {pageTitle}
          </Typography>
        )}

        

        {/* RIGHT: Actions + Home Icon */}
        <Box className={styles.rightSection}>
          {/* Home Icon - Always visible */}
          <IconButton onClick={() => navigate("/news")} className={styles.homeIcon}>
            <Home />
          </IconButton>

          <IconButton onClick={() => navigate("/bookmarks")}>
            <Bookmark className={styles.actionIcon} />
          </IconButton>
          <IconButton onClick={() => navigate("/history")}>
            <AccessTime className={styles.actionIcon} />
          </IconButton>
          <IconButton onClick={handleAlertsClick} className={styles.alertIcon}>
            <Announcement />
          </IconButton>
          <IconButton onClick={handleMenuClick}>
            <Avatar className={styles.avatar}>{avatarLetter}</Avatar>
          </IconButton>

        </Box>
        <Menu
          anchorEl={alertsAnchorEl}
          open={Boolean(alertsAnchorEl)}
          onClose={handleAlertsClose}
          PaperProps={{ className: styles.alertsMenuPaper }}
        >
          {alerts.length === 0 ? (
            <MenuItem className={styles.alertsMenuItem} disabled>
              No alerts
            </MenuItem>
          ) : (
            alerts.map((alert, index) => (
              <MenuItem
                key={index}
                className={styles.alertsMenuItem}
                onClick={() => {
                  if (alert.url) {
                    console.log("Opening alert link:", alert.url);
                    window.open(alert.url, "_blank", "noopener,noreferrer");
                  } else {
                    console.warn("Alert link missing:", alert);
                  }
                  handleAlertsClose();
                }}
              >
                <Box display="flex" alignItems="center">
                  {alert.isVideo && (
                    <PlayCircleOutline sx={{ mr: 1, color: "#FF5252", fontSize: 18 }} />
                  )}
                  <Typography className={styles.alertTitle}>{alert.title}</Typography>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>




        {/* Dropdown Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleNavigate("/profile")}>
            <AccountCircle sx={{ mr: 1 }} />
            <span className={styles.menuItemText}>Profile</span>
          </MenuItem>
          {/* <MenuItem onClick={() => handleNavigate("/settings")}>
            <Settings sx={{ mr: 1 }} />
            <span className={styles.menuItemText}>Settings</span>
          </MenuItem> */}
          <MenuItem onClick={handleLogout}>
            <Logout sx={{ mr: 1 }} />
            <span className={styles.menuItemText}>Logout</span>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;