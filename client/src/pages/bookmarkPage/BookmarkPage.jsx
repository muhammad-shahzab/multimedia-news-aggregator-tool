"use client";

import { useState, useEffect,  } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from "@mui/material";
import {
  Share,
  BookmarkRemove,
  MoreVert,
} from "@mui/icons-material";
import { bookmarksAPI } from "../../services/api";
import styles from "./BookmarkPage.module.css";

const BookmarkPage = () => {
 

  const [anchorEl, setAnchorEl] = useState(null);
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
       console.log(bookmarkToRemove)
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

        {/* === EMPTY STATE === */}
        {bookmarks.length === 0 ? (
          <Card className={styles.emptyCard}>
            <CardContent className={styles.emptyCardContent}>
              <Typography variant="h6" className={styles.emptyTitle}>
                No bookmarks found
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box className={styles.bookmarksList}>
            {bookmarks.map((b) => (
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


                      <Box className={styles.articleMeta}>
                        <Box className={styles.metaLeft}>
                          <span>{b.channel || "Unknown"}</span>
                          <span>•</span>
                         
                        </Box>
                     
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