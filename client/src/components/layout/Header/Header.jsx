// components/layout/Header.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  AppBar, Toolbar, Typography, TextField, InputAdornment,
  IconButton, Avatar, Menu, MenuItem, Box
} from "@mui/material";
import {
  Search, Bookmark, AccessTime, AccountCircle,
  Settings, Logout, Menu as MenuIcon, Home
} from "@mui/icons-material";
import { debounce } from "lodash";
import { useAuth } from "../../../context/AuthContext";
import { useSearch } from "../../../context/SearchContext";
import { useDrawer } from "../../../context/DrawerContext";
import styles from "./Header.module.css";

import logoLight from "./lightLogo.png";




const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const { setDrawerOpen } = useDrawer();
  const [anchorEl, setAnchorEl] = useState(null);



  const isNewsPage = location.pathname === "/news";

  // Page titles (except /news)
  const pageTitles = {
    "/bookmarks": "Bookmarks",
    "/history": "Reading History",
    "/profile": "Profile",
    "/settings": "Settings",
  };

  const pageTitle = pageTitles[location.pathname] || null;

  const debouncedSearch = useMemo(
    () => debounce((v) => setSearchQuery(v), 300),
    [setSearchQuery]
  );

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
    <AppBar position="sticky"  className={styles.appbar}>
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

        {/* Search (ONLY on /news) */}
        {isNewsPage && (
          <div className={styles.searchContainer}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search news, topics, or sources..."
              value={searchQuery}
              onChange={(e) => debouncedSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className={styles.searchIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </div>
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
          <IconButton onClick={handleMenuClick}>
            <Avatar className={styles.avatar}>{avatarLetter}</Avatar>
          </IconButton>
        </Box>

        {/* Dropdown Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleNavigate("/profile")}>
            <AccountCircle sx={{ mr: 1 }} />
            <span className={styles.menuItemText}>Profile</span>
          </MenuItem>
          <MenuItem onClick={() => handleNavigate("/settings")}>
            <Settings sx={{ mr: 1 }} />
            <span className={styles.menuItemText}>Settings</span>
          </MenuItem>
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