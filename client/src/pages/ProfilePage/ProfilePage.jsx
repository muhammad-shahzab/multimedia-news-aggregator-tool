"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  TextField,
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Chip,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import {
  AccountCircle,
  Settings,
  Logout,
  Public,
  Close,
  Bookmark,
  History,
  ContentCopy,
  CameraAlt,
  CheckCircle,
  Error,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Sync with auth user
  useEffect(() => {
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setAvatarPreview(user?.avatar || "");
  }, [user]);

  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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

  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
    setError("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      setError("Username and email are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address.");
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 800));

      const updatedUser = { username, email, avatar: avatarPreview };
      localStorage.setItem("userProfile", JSON.stringify(updatedUser));
      // In real app: await updateProfile(updatedUser, avatarFile);

      setEditMode(false);
      setError("");
      alert("Profile updated!");
    } catch (err) {
      setError("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    alert("Email copied!");
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "Unknown";

  return (
    <Box className={styles.pageContainer}>
    

      <Box className={styles.mainContent}>
        {error && (
          <Alert severity="error" className={styles.errorAlert} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* PROFILE CARD */}
        <Card className={styles.profileCard}>
          <CardContent className={styles.profileCardContent}>
            <Box className={styles.profileHeader}>
              <Box className={styles.avatarSection}>
                <Avatar
                  src={avatarPreview}
                  className={styles.profileAvatar}
                  onClick={() => editMode && fileInputRef.current?.click()}
                >
                  {username.charAt(0).toUpperCase() || "U"}
                </Avatar>
                {editMode && (
                  <Tooltip title="Change photo">
                    <IconButton
                      className={styles.cameraButton}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CameraAlt />
                    </IconButton>
                  </Tooltip>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileSelect}
                />
              </Box>

              <Box className={styles.profileInfo}>
                {editMode ? (
                  <Box className={styles.editForm}>
                    <TextField
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      fullWidth
                      className={styles.editField}
                    />
                    <TextField
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      className={styles.editField}
                    />
                    <Box className={styles.editActions}>
                      <Button variant="contained" onClick={handleSave} disabled={saving}>
                         Save
                      </Button>
                      <Button variant="outlined" onClick={handleEditToggle} disabled={saving}>
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h5" className={styles.profileName}>
                      {username || "User"}
                    </Typography>
                    <Box className={styles.emailRow}>
                      <Typography variant="body1" className={styles.profileEmail}>
                        {email || "No email"}
                      </Typography>
                      {email && (
                        <Tooltip title="Copy email">
                          <IconButton size="small" onClick={handleCopyEmail}>
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Button variant="outlined" onClick={handleEditToggle} className={styles.editButton}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </Box>
            </Box>

            {/* STATS */}
            <Box className={styles.statsGrid}>
              <Box className={styles.statItem}>
                <Typography variant="h4" className={styles.statValue}>
                  {user?.bookmarks?.length || 0}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Bookmarks
                </Typography>
              </Box>
              <Box className={styles.statItem}>
                <Typography variant="h4" className={styles.statValue}>
                  {user?.history?.length || 0}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Articles Read
                </Typography>
              </Box>
              <Box className={styles.statItem}>
                <Typography variant="body2" className={styles.statLabel}>
                  Member since
                </Typography>
                <Typography variant="body2" className={styles.statValueSmall}>
                  {joinedDate}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* LOGOUT DIALOG */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Log Out?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will be signed out of your account.
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

export default ProfilePage;