"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Search,
  History,
  Bookmark,
  Share,
  Delete,
  TrendingUp,
  CalendarToday,
  MoreVert,
  ArrowBack,
  Public,
  Link,
  OpenInNew,
  Language,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { historyAPI, bookmarksAPI } from "../../services/api";
import { debounce } from "lodash";
import styles from "./ReadingHistoryPage.module.css";

const ReadingHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalArticles: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyToRemove, setHistoryToRemove] = useState(null);

  const timeframes = ["today", "week", "month"];

  // === LOAD STATS ===
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const response = await historyAPI.getStats();
        setStats({ totalArticles: response.data.totalArticles || 0 });
      } catch (err) {
        console.error(err);
        setError("Failed to load stats.");
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  // === LOAD HISTORY ===
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoadingHistory(true);
        setError("");
        const timeframe = timeframes[activeTab];
        const response = await historyAPI.getHistory(timeframe);
        setHistory(response.data);
      } catch (err) {
        setError("Failed to load history.");
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [activeTab]);

  // === SEARCH ===
  const debouncedSearch = useCallback(debounce(setSearchQuery, 300), []);

  const filteredHistory = useMemo(() => {
    return history.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  // === ACTIONS ===
  const handleMenuClick = (e, article) => {
    setAnchorEl(e.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };

  const handleBookmark = async (article) => {
    try {
      await bookmarksAPI.addBookmark({
        articleId: article.articleId,
        title: article.title,
        url: article.url,
        source: article.source,
        category: article.category,
        summary: "Bookmarked from history",
      });
      alert("Bookmarked!");
      handleMenuClose();
    } catch (err) {
      alert("Failed to bookmark.");
    }
  };

  const handleShare = useCallback((article) => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: article.url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(article.url);
      alert("Link copied!");
    }
    handleMenuClose();
  }, []);

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
    handleMenuClose();
  };

  const handleOpenArticle = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenSource = (sourceUrl) => {
    window.open(sourceUrl, "_blank", "noopener,noreferrer");
  };

  const handleConfirmRemove = (id) => {
    setHistoryToRemove(id);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleRemoveFromHistory = async () => {
    if (!historyToRemove) return;
    try {
      await historyAPI.deleteHistory(historyToRemove);
      setHistory(prev => prev.filter(item => item._id !== historyToRemove));
      const statsRes = await historyAPI.getStats();
      setStats({ totalArticles: statsRes.data.totalArticles || 0 });
    } catch (err) {
      alert("Failed to remove.");
    } finally {
      setConfirmOpen(false);
      setHistoryToRemove(null);
    }
  };

  const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // === RENDER ===
  if (loadingStats) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress size={48} />
        <Typography variant="body2" mt={2}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.pageContainer}>

      <Box className={styles.mainContent}>
        {error && (
          <Alert severity="error" className={styles.errorAlert} action={
            <Button size="small" onClick={() => setActiveTab(activeTab)}>Retry</Button>
          }>
            {error}
          </Alert>
        )}

        {/* STATS */}
        <Box className={styles.statsSection}>
          <Typography variant="h4" className={styles.statsTitle}>
            Reading History
          </Typography>
          <Typography variant="body1" className={styles.statsText}>
            Revisit articles you’ve read
          </Typography>

          <Box className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <CardContent className={styles.statCardContent}>
                <Typography variant="h4" className={styles.statValue}>
                  {stats.totalArticles}
                </Typography>
                <Typography variant="body2" className={styles.statLabel}>
                  Articles Visited
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* SEARCH */}
        <Card className={styles.searchCard}>
          <CardContent className={styles.searchCardContent}>
            <TextField
              fullWidth
              placeholder="Search by title or source..."
              onChange={(e) => debouncedSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              className={styles.searchField}
            />
          </CardContent>
        </Card>

        {/* TABS */}
        <Card className={styles.tabsCard}>
          <Box className={styles.tabContainer}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label="Today" icon={<CalendarToday />} iconPosition="start" />
              <Tab label="Week" icon={<History />} iconPosition="start" />
              <Tab label="Month" icon={<TrendingUp />} iconPosition="start" />
            </Tabs>
          </Box>
        </Card>

        {/* HISTORY LIST */}
        {loadingHistory ? (
          <Box className={styles.loadingHistoryContainer}>
            <CircularProgress />
          </Box>
        ) : filteredHistory.length === 0 ? (
          <Card className={styles.emptyCard}>
            <CardContent className={styles.emptyCardContent}>
              <History className={styles.emptyIcon} />
              <Typography variant="h6" className={styles.emptyTitle}>
                No history
              </Typography>
              <Typography variant="body2" className={styles.emptyText}>
                {searchQuery ? "Try another search" : "Start reading to see history"}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box className={styles.historyList}>
            {filteredHistory.map((a) => (
              <Card key={a._id} className={styles.historyCard}>
                <CardContent className={styles.historyCardContent}>
                  <Box className={styles.historyContent}>
                    <Box className={styles.articleDetails}>
                      <Box className={styles.articleHeader}>
                        <Box className={styles.chipContainer}>
                          <Chip label={a.category} size="small" />
                          {a.source && (
                            <Tooltip title="Open source website">
                              <Chip
                                label={a.source}
                                size="small"
                                icon={<Language />}
                                onClick={() => handleOpenSource(a.sourceUrl || `https://${a.source}`)}
                                className={styles.sourceChip}
                                clickable
                              />
                            </Tooltip>
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, a)}
                          aria-label="More options"
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Typography
                        variant="h6"
                        className={styles.articleTitle}
                        onClick={() => handleOpenArticle(a.url)}
                        onKeyDown={(e) => e.key === "Enter" && handleOpenArticle(a.url)}
                        tabIndex={0}
                        role="link"
                      >
                        {a.title}
                      </Typography>

                      <Box className={styles.articleMeta}>
                        <Box className={styles.actionButtons}>
                          <Tooltip title="Revisit article">
                            <IconButton size="small" onClick={() => handleOpenArticle(a.url)}>
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy link">
                            <IconButton size="small" onClick={() => handleCopyLink(a.url)}>
                              <Link fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="caption" className={styles.readTimeText}>
                          {formatTimeAgo(a.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* MENU */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleBookmark(selectedArticle)}>
            <Bookmark fontSize="small" sx={{ mr: 1 }} /> Bookmark
          </MenuItem>
          <MenuItem onClick={() => handleShare(selectedArticle)}>
            <Share fontSize="small" sx={{ mr: 1 }} /> Share
          </MenuItem>
          <MenuItem onClick={() => handleCopyLink(selectedArticle?.url)}>
            <Link fontSize="small" sx={{ mr: 1 }} /> Copy Link
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleConfirmRemove(selectedArticle?._id)}>
            <Delete fontSize="small" sx={{ mr: 1, color: "error.main" }} /> Remove
          </MenuItem>
        </Menu>

        {/* CONFIRM DIALOG */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Remove from History?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This article will be removed from your history.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleRemoveFromHistory} color="error" variant="contained">
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ReadingHistoryPage;