"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Sort,
  Share,
  Delete,
  BookmarkRemove,
  AccessTime,
  MoreVert,
  ArrowBack,
  Public,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { bookmarksAPI } from "../../services/api";
import { debounce } from "lodash";
import styles from "./BookmarkPage.module.css";

const BookmarkPage = () => {
  // const navigate = useNavigate();
  // const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookmarkToRemove, setBookmarkToRemove] = useState(null);

  // === FETCH BOOKMARKS ===
  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await bookmarksAPI.getBookmarkedArticles();
      setBookmarks(response.data.data);
    } catch (err) {
      setError("Failed to load bookmarks. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // === CATEGORIES ===
  const categories = useMemo(() => {
    const cats = new Set(bookmarks.map(b => b.category).filter(Boolean));
    return ["all", ...Array.from(cats)];
  }, [bookmarks]);

  // === MENU HANDLERS ===
  const handleMenuClick = (e, article) => {
    setAnchorEl(e.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };

  const handleConfirmRemove = (id) => {
    setBookmarkToRemove(id);
    setConfirmOpen(true);
    handleMenuClose();
  };

  const handleRemoveBookmark = async () => {
    if (!bookmarkToRemove) return;
    try {
      await bookmarksAPI.removeBookmark(bookmarkToRemove);
      setBookmarks(prev => prev.filter(b => b._id !== bookmarkToRemove));
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmOpen(false);
      setBookmarkToRemove(null);
    }
  };

  const handleShare = (article) => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: article.url }).catch(console.error);
    } else {
      navigator.clipboard.writeText(article.url);
      alert("Link copied!");
    }
    handleMenuClose();
  };

  // === SEARCH DEBOUNCE ===
  const debouncedSearch = useCallback(debounce(setSearchQuery, 300), []);

  // === FILTER & SORT ===
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.summary?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || b.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [bookmarks, searchQuery, filterCategory]);

  const sortedBookmarks = useMemo(() => {
    return [...filteredBookmarks].sort((a, b) => {
      switch (sortBy) {
        case "recent": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });
  }, [filteredBookmarks, sortBy]);

  // === UTILS ===
  const formatTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const estimateReadTime = (text) => {
    const words = text?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / 200));
  };

  // === RENDER ===
  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress size={48} />
        <Typography variant="body2" mt={2}>Loading your bookmarks...</Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.pageContainer}>


      <Box className={styles.mainContent}>
        {error && (
          <Alert severity="error" className={styles.errorAlert} action={
            <Button size="small" onClick={fetchBookmarks}>Retry</Button>
          }>
            {error}
          </Alert>
        )}

        {/* === STATS === */}
        <Box className={styles.statsSection}>
          <Typography variant="h4" className={styles.statsTitle}>
            My Bookmarks
          </Typography>
          <Typography variant="body1" className={styles.statsText}>
            {bookmarks.length} article{bookmarks.length !== 1 ? "s" : ""} saved
          </Typography>
        </Box>

        {/* === SEARCH & FILTER === */}
        <Card className={styles.filterCard}>
          <CardContent className={styles.filterCardContent}>
            <Box className={styles.filterBar}>
              <TextField
                fullWidth
                placeholder="Search in titles & summaries..."
                onChange={(e) => debouncedSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                }}
                className={styles.searchField}
              />

              <Button
                variant="outlined"
                startIcon={<Sort />}
                onClick={(e) => setSortAnchorEl(e.currentTarget)}
                className={styles.sortButton}
              >
                Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </Button>
            </Box>

            <Box className={styles.categoryChips}>
              {categories.map(cat => (
                <Chip
                  key={cat}
                  label={cat === "all" ? "All" : cat}
                  onClick={() => setFilterCategory(cat)}
                  color={filterCategory === cat ? "primary" : "default"}
                  variant={filterCategory === cat ? "filled" : "outlined"}
                  className={styles.chip}
                />
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* === EMPTY STATE === */}
        {sortedBookmarks.length === 0 ? (
          <Card className={styles.emptyCard}>
            <CardContent className={styles.emptyCardContent}>
              <Typography variant="h6" className={styles.emptyTitle}>
                No bookmarks found
              </Typography>
              <Typography variant="body2" className={styles.emptyText}>
                {searchQuery || filterCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Save articles from the news feed to see them here"}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box className={styles.bookmarksList}>
            {sortedBookmarks.map((b) => (
              <Card key={b._id} className={styles.bookmarkCard}>
                <CardContent className={styles.bookmarkCardContent}>
                  <Box className={styles.bookmarkContent}>
                    {/* Image */}
                    {b.image && (
                      <Box className={styles.imageContainer}>
                        <img
                          src={b.image}
                          alt=""
                          className={styles.articleImage}
                          onError={(e) => e.currentTarget.style.display = "none"}
                        />
                      </Box>
                    )}

                    {/* Content */}
                    <Box className={styles.articleDetails}>
                      <Box className={styles.articleHeader}>
                        <Chip label={b.category} size="small" />
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, b)}
                          aria-label="More options"
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Typography
                        variant="h6"
                        className={styles.articleTitle}
                        onClick={() => window.open(b.url, "_blank")}
                        onKeyDown={(e) => e.key === "Enter" && window.open(b.url, "_blank")}
                        tabIndex={0}
                        role="link"
                      >
                        {b.title}
                      </Typography>

                      <Typography variant="body2" className={styles.articleSummary}>
                        {b.summary}
                      </Typography>

                      {/* {b.tags?.length > 0 && (
                        <Box className={styles.tagsContainer}>
                          {b.tags.slice(0, 3).map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                          {b.tags.length > 3 && (
                            <Tooltip title={b.tags.slice(3).join(", ")}>
                              <Chip label={`+${b.tags.length - 3}`} size="small" />
                            </Tooltip>
                          )}
                        </Box>
                      )} */}

                      <Box className={styles.articleMeta}>
                        <Box className={styles.metaLeft}>
                          <span>{b.channel || "Unknown"}</span>
                          <span>•</span>
                          {/* <Box className={styles.readTime}>
                            <AccessTime fontSize="small" />
                            <span>{estimateReadTime(b.summary)} min</span>
                          </Box> */}
                        </Box>
                        {/* <Typography variant="caption" className={styles.bookmarkedTime}>
                          {formatTimeAgo(b.createdAt)}
                        </Typography> */}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* === MENUS === */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleShare(selectedArticle)}>
            <Share fontSize="small" sx={{ mr: 1 }} /> Share
          </MenuItem>
          <MenuItem onClick={() => handleConfirmRemove(selectedArticle?._id)}>
            <BookmarkRemove fontSize="small" sx={{ mr: 1 }} /> Remove
          </MenuItem>
        </Menu>

        <Menu anchorEl={sortAnchorEl} open={Boolean(sortAnchorEl)} onClose={() => setSortAnchorEl(null)}>
          {["recent", "oldest", "title"].map(opt => (
            <MenuItem key={opt} onClick={() => { setSortBy(opt); setSortAnchorEl(null); }}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </MenuItem>
          ))}
        </Menu>

        {/* === CONFIRM DIALOG === */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Remove Bookmark?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This article will be removed from your bookmarks permanently.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleRemoveBookmark} color="error" variant="contained">
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default BookmarkPage;