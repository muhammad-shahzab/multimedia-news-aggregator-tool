import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { userAPI } from "../../../services/api";
import ArticleCard from "../ArticleCard";
import styles from "./NewsFeed.module.css";
import NewsNavbar from "../NewsBar/NewsNavBar";

const NewsFeed = ({
  selectedCategory,
  newsArticles,
  loading,
  bookmarkedArticles,
  // handleBookmark,
  handleReadArticle,
  formatTimeAgo,
  onTabChange,     //  parent callback for tab
  onChannelChange,
}) => {

  // ──────────────────────────────
  // Local States
  // ──────────────────────────────
  const [activeTab, setActiveTab] = useState("Home");
  const [activeFilter, setActiveFilter] = useState("All");
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [visibleList, setVisibleList] = useState(newsArticles);
  const [searchQuery, setSearchQuery] = useState("");


  // ──────────────────────────────
  // Handlers
  // ──────────────────────────────
  const handleFilterClick = (e) => setFilterAnchor(e.currentTarget);


  // === Channel Selection ===
  const handleChannelSelect = async (channelName) => {
    setSelectedChannel(channelName);
       setActiveFilter("All")
    setActiveTab(null);
    if (onChannelChange) onChannelChange(channelName);
    try {
      const { data } = await userAPI.checkFavChannel(channelName);

      if (data && typeof data.fav === "boolean") {
        setIsFollowingChannel(data.fav);
      } else {
        console.error("  Invalid response from backend:", data);
      }
    } catch (err) {
      console.error("  Error checking follow status:", err);
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
        console.error("  Invalid response from backend:", data);
      }
    } catch (err) {
      // revert UI if error
      setIsFollowingChannel((prev) => !prev);
    }
  };

  // === Tab Change ===
  const handleTabChange = (tab) => {
    setSelectedChannel(null);
    setVisibleList([])
    setActiveTab(tab)
    setActiveFilter("All")
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (!newsArticles) return;
    const initialArticles = newsArticles || [];
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
// 🔎 Filter articles by search
useEffect(() => {
  if (!newsArticles) return;

  if (!searchQuery.trim()) {
    setVisibleList(newsArticles); 
    return;
  }

  const lower = searchQuery.toLowerCase();

  const filtered = newsArticles.filter((article) =>
    article.title?.toLowerCase().includes(lower) ||
    article.description?.toLowerCase().includes(lower) ||
    article.channel?.toLowerCase().includes(lower)
  );

  setVisibleList(filtered);
}, [searchQuery, newsArticles]);


  const handleFilterSelect = (filter) => {
  setActiveFilter(filter);
  setFilterAnchor(null);


  if (filter === "Articles") {
    const articlesOnly = newsArticles.filter(
      (article) => article.isVideo === false
    );
    setVisibleList(articlesOnly);
  } 
  else if (filter === "Videos") {
    const videosOnly = newsArticles.filter(
      (article) => article.isVideo === true
    );
    setVisibleList(videosOnly);
  } 
  else {
    setVisibleList(newsArticles);
  }
};



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
         searchQuery={searchQuery}  
        setSearchQuery={setSearchQuery}
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
      ) :
        (
          <>
            <div className={styles.feedWrapper}>
              {visibleList.length ===0 ? (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                  mt={4}
                >
                  {/* No articles available for this selection. */}
                </Typography>
              ) : (
                visibleList.map((article) => (
                  <ArticleCard
                    key={article._id || article.id}
                    article={article}
                    bookmarkedArticles={bookmarkedArticles}
                    //    handleBookmark={handleBookmark}
                    handleReadArticle={handleReadArticle}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))
              )}
            </div>
          </>
        )}


    </Box>
  );
};

export default NewsFeed;
