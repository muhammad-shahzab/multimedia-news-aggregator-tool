import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { userAPI } from "../../../services/api";
import ArticleCard from "../ArticleCard";
import YouTubeFeed from "../YouTubeFeed";
import styles from "./NewsFeed.module.css";
import NewsNavbar from "../NewsBar/NewsNavBar";

const NewsFeed = ({
  selectedCategory,
  newsArticles,
  loading,
  bookmarkedArticles,
  handleBookmark,
  handleReadArticle,
  formatTimeAgo,
  onTabChange,     // ✅ parent callback for tab
  onChannelChange,
}) => {
  const theme = useTheme();

  // ──────────────────────────────
  // Local States
  // ──────────────────────────────
  const [activeTab, setActiveTab] = useState("Home");
  const [activeFilter, setActiveFilter] = useState("Articles");
  const [filterAnchor, setFilterAnchor] = useState(null);

  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);

  const [visibleList, setVisibleList] = useState(newsArticles);

  // ──────────────────────────────
  // Handlers
  // ──────────────────────────────
  const handleFilterClick = (e) => setFilterAnchor(e.currentTarget);

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    setFilterAnchor(null);
    console.log("🧩 Filter changed to:", filter);
  };

  // === Channel Selection ===
  const handleChannelSelect = async (channelName) => {
    setSelectedChannel(channelName);
    setActiveTab(null);
    if (onChannelChange) onChannelChange(channelName);
    try {
      const { data } = await userAPI.checkFavChannel(channelName);

      if (data && typeof data.fav === "boolean") {
        setIsFollowingChannel(data.fav);
        console.log(
          data.fav
            ? `⭐ ${channelName} is already being followed`
            : `👀 ${channelName} is not followed`
        );
      } else {
        console.error("❌ Invalid response from backend:", data);
      }
    } catch (err) {
      console.error("❌ Error checking follow status:", err);
    }
  };

  // === Toggle Follow / Unfollow Channel ===
  const handleFollowChannel = async () => {
    if (!selectedChannel) return;
    try {
      setIsFollowingChannel((prev) => !prev);
      const { data } = await userAPI.toggleFavChannel(selectedChannel);
      if (data && typeof data.fav === "boolean") {
        setIsFollowingChannel(data.fav);
      } else {
        console.error("❌ Invalid response from backend:", data);
      }
    } catch (err) {
      // revert UI if error
      setIsFollowingChannel((prev) => !prev);
    }
  };

  // === Tab Change ===
  const handleTabChange = (tab) => {
    setSelectedChannel(null);
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  // ──────────────────────────────
  // filters for articles
  // ──────────────────────────────
  useEffect(() => {
    if (!newsArticles) return;
    // Take the first 50 articles as a temporary subset
    const initialArticles = newsArticles.slice(0, 50);
    setVisibleList(initialArticles);

  }, [newsArticles])

  useEffect(() => {
    if (!newsArticles) return;

    const filteredArticles = selectedCategory
      ? newsArticles.filter(
        (article) =>
          article.category.toLowerCase() === selectedCategory.toLowerCase()
      )
      : newsArticles;

    setVisibleList(filteredArticles);
  }, [selectedCategory, newsArticles]);


  // === Pagination ===
  // const handleLoadMore = async () => {
  //   setLoadingMore(true);
  //   try {
  //     await fetchMoreArticles();
  //     setVisibleArticles((prev) => prev + 30);
  //   } catch (err) {
  //     console.error("Error loading more articles:", err);
  //   } finally {
  //     setLoadingMore(false);
  //   }
  // };

  // ──────────────────────────────
  // Derived UI Logic
  // ──────────────────────────────
  const shouldShowVideos = activeFilter === "Videos" || activeFilter === "All";
  const shouldShowArticles =
    activeFilter === "Articles" || activeFilter === "All";



  // ──────────────────────────────
  // JSX Rendering
  // ──────────────────────────────
  return (
    <Box className={styles.newsFeedContainer}>
      <NewsNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedChannel={selectedChannel}
        onChannelSelect={handleChannelSelect}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        mb={3}
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            {selectedChannel || activeTab}
          </Typography>

          {/* Follow / Unfollow Button */}
          {selectedChannel && (
            <Button
              variant={isFollowingChannel ? "contained" : "outlined"}
              color="primary"
              onClick={handleFollowChannel}
            >
              {isFollowingChannel ? "Following" : "Follow"}
            </Button>
          )}
        </Box>

        {/* Filter */}
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <Button
            variant="outlined"
            endIcon={<ExpandMoreIcon />}
            onClick={handleFilterClick}
            sx={{ textTransform: "none" }}
          >
            {activeFilter}
          </Button>
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
          >
            <MenuItem onClick={() => handleFilterSelect("Articles")}>
              Articles Only
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect("Videos")}>
              Videos Only
            </MenuItem>
            <MenuItem onClick={() => handleFilterSelect("All")}>
              Both Combined
            </MenuItem>
          </Menu>
        </Box>
      </Box>


      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {shouldShowVideos && !shouldShowArticles ? (
            <YouTubeFeed category={selectedCategory} />
          ) : (
            <>
              {shouldShowVideos && (
                <Box mb={4}>
                  <Typography variant="h6" mb={2}>
                    Video Highlights
                  </Typography>
                  <YouTubeFeed category={selectedCategory} />
                </Box>
              )}

              {shouldShowArticles && (
                <div className={styles.feedWrapper}>
                  {visibleList.length == null ? (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      textAlign="center"
                      mt={4}
                    >
                      No articles available for this selection.
                    </Typography>
                  ) : (
                    visibleList.map((article) => (
                      <ArticleCard
                        key={article._id || article.id}
                        article={article}
                        bookmarkedArticles={bookmarkedArticles}
                        handleBookmark={handleBookmark}
                        handleReadArticle={handleReadArticle}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}


        </>
      )}




      {/* {newsArticles.length > visibleArticles && (
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            sx={{
              color: "text.primary",
              borderColor: "divider",
              "&:hover": { borderColor: "primary.main" },
              minWidth: 160,
            }}
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? <CircularProgress size={24} /> : "Load More Articles"}
          </Button>
        </Box>
      )} */}
    </Box>
  );
};

export default NewsFeed;
