"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Box,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  AccountCircle,
  Settings,
  Logout,
  Public,
  Close,
  Bookmark,
  History,
  DarkMode,
  LightMode,
  Notifications,
  NotificationsOff,
  Palette,
  Language,
  Security,
  DeleteForever,
  Save,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import styles from "./SettingsPage.module.css";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [language, setLanguage] = useState("en");

  // Load settings
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedNotif = localStorage.getItem("notifications") === "true";
    const savedAutoSave = localStorage.getItem("autoSave") !== "false";
    const savedLang = localStorage.getItem("language") || "en";

    setTheme(savedTheme);
    setNotifications(savedNotif);
    setAutoSave(savedAutoSave);
    setLanguage(savedLang);

    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Save theme
  const handleThemeChange = (checked) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Save other settings
  const saveSetting = (key, value) => {
    localStorage.setItem(key, value);
  };

  const handleNotificationsChange = (checked) => {
    setNotifications(checked);
    saveSetting("notifications", checked);
  };

  const handleAutoSaveChange = (checked) => {
    setAutoSave(checked);
    saveSetting("autoSave", checked);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    saveSetting("language", lang);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      setError("Logout failed. Try again.");
    } finally {
      setLogoutOpen(false);
    }
  };

  const menuClick = (e) => setAnchorEl(e.currentTarget);
  const menuClose = () => setAnchorEl(null);

  return (
    <Box className={styles.pageContainer}>
    
      <Box className={styles.mainContent}>
        {error && (
          <Alert severity="error" className={styles.errorAlert} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* APPEARANCE */}
        <Card className={styles.settingsCard}>
          <CardContent className={styles.cardContent}>
            <Box className={styles.sectionHeader}>
              <Palette className={styles.sectionIcon} />
              <Typography variant="h6" className={styles.sectionTitle}>
                Appearance
              </Typography>
            </Box>
            <Divider className={styles.divider} />
            <FormControlLabel
              control={
                <Switch
                  checked={theme === "dark"}
                  onChange={(e) => handleThemeChange(e.target.checked)}
                  icon={<LightMode />}
                  checkedIcon={<DarkMode />}
                />
              }
              label="Dark Mode"
              className={styles.switchLabel}
            />
          </CardContent>
        </Card>

        {/* NOTIFICATIONS */}
        <Card className={styles.settingsCard}>
          <CardContent className={styles.cardContent}>
            <Box className={styles.sectionHeader}>
              <Notifications className={styles.sectionIcon} />
              <Typography variant="h6" className={styles.sectionTitle}>
                Notifications
              </Typography>
            </Box>
            <Divider className={styles.divider} />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={(e) => handleNotificationsChange(e.target.checked)}
                  icon={<NotificationsOff />}
                  checkedIcon={<Notifications />}
                />
              }
              label="Push Notifications"
              className={styles.switchLabel}
            />
            <Typography variant="body2" className={styles.helperText}>
              Get alerts for breaking news and updates
            </Typography>
          </CardContent>
        </Card>

        {/* PREFERENCES */}
        <Card className={styles.settingsCard}>
          <CardContent className={styles.cardContent}>
            <Box className={styles.sectionHeader}>
              <Settings className={styles.sectionIcon} />
              <Typography variant="h6" className={styles.sectionTitle}>
                Preferences
              </Typography>
            </Box>
            <Divider className={styles.divider} />

            <FormControlLabel
              control={
                <Switch
                  checked={autoSave}
                  onChange={(e) => handleAutoSaveChange(e.target.checked)}
                />
              }
              label="Auto-save reading progress"
              className={styles.switchLabel}
            />

            <Box className={styles.languageSection}>
              <Typography variant="body2" className={styles.label}>
                Language
              </Typography>
              <Box className={styles.chipGroup}>
                {["en", "es", "fr", "de"].map((lang) => (
                  <Chip
                    key={lang}
                    label={lang.toUpperCase()}
                    onClick={() => handleLanguageChange(lang)}
                    color={language === lang ? "primary" : "default"}
                    className={styles.langChip}
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ACCOUNT */}
        <Card className={styles.settingsCard}>
          <CardContent className={styles.cardContent}>
            <Box className={styles.sectionHeader}>
              <Security className={styles.sectionIcon} />
              <Typography variant="h6" className={styles.sectionTitle}>
                Account
              </Typography>
            </Box>
            <Divider className={styles.divider} />
            <Button
              fullWidth
              variant="outlined"
              startIcon={<DeleteForever />}
              className={styles.dangerButton}
              onClick={() => alert("Clear cache feature coming soon!")}
            >
              Clear Cache & Data
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* LOGOUT DIALOG */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Log Out?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will be signed out of NewsHub.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;