

import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import "./NewsPage.css";

import {
  AccountCircle,
  Public,
  Business,
  Sports,
  Movie,
  HealthAndSafety,
  Science,
} from "@mui/icons-material";

import { useAuth } from "../../context/AuthContext";
import {
  newsAPI,
  bookmarksAPI,
  historyAPI,
  channelsAPI,
} from "../../services/api";

import Sidebar from "../../components/global/Sidebar";
import ErrorAlert from "../../components/news/ErrorAlert";

const NewsFeed = lazy(() => import("../../components/news/Feed/NewsFeed"));

const NewsPage = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("Home"); // ✅ Added for tab mode
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const defaultCategories = [
    { id: "for-you", label: "For You", icon: <AccountCircle /> },
    { id: "technology", label: "Technology", icon: <Public /> },
    { id: "business", label: "Business", icon: <Business /> },
    { id: "sports", label: "Sports", icon: <Sports /> },
    { id: "entertainment", label: "Entertainment", icon: <Movie /> },
    { id: "health", label: "Health", icon: <HealthAndSafety /> },
    { id: "science", label: "Science", icon: <Science /> },
    { id: "world", label: "World News", icon: <Public /> },
  ];

  // ──────────────────────────────────────────────
  // Initial Load (default = Home tab)
  // ──────────────────────────────────────────────
  useEffect(() => {
    Promise.all([fetchChannels(), fetchBookmarks(), fetchTabArticles("Home")])
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);


  // ──────────────────────────────────────────────
  // Dedicated Tab Fetch Function
  // ──────────────────────────────────────────────
  const fetchTabArticles = async (tabName, pageNum = 1) => {
    try {
      setLoading(true);
      let response;
      console.log(`🧭 Fetching tab news: ${tabName} (page ${pageNum})`);
      response = await newsAPI.fetchArticlesByTab(tabName, pageNum);

      if (pageNum === 1) setArticles(response.data.data || []);
      else setArticles((prev) => [...prev, ...(response.data.data || [])]);

    } catch (err) {
      console.error("❌ Error fetching news:", err);
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────
  // Dedicated Channel Fetch Function
  // ──────────────────────────────────────────────
  const fetchChannelArticles = async (channelName) => {
    setLoadingArticles(true)
    try {
      let response;
      setArticles([]);
      console.log(`🌍 Fetching channel news: ${channelName}`);
      response = await channelsAPI.fetchNewsByChannel(channelName);
      setArticles(response.data.data || []);
      console.log("Articles after fetch:", articles);
    } catch (err) {
      console.error("❌ Error fetching news:", err);
      setError("Failed to fetch news");
    } finally {
      setLoadingArticles(false);
    }
  };

  // ──────────────────────────────────────────────
  // Pagination
  // ──────────────────────────────────────────────
  const fetchMoreArticles = async () => {
    // try {
    //   const nextPage = page + 1;
    //   if (selectedChannel)
    //     await fetchChannelArticles(selectedChannel.name, nextPage);
    //   else await fetchTabArticles(activeTab, nextPage);

    //   setPage(nextPage);
    // } catch (err) {
    //   console.error("❌ Error loading more:", err);
    // }
  };

  // ──────────────────────────────────────────────
  // Channel and Tab Selection Logic
  // ──────────────────────────────────────────────
  const handleSelectedChannelChange = (channelName) => {
    console.log("Parent knows selected channel:", channelName);
    setSelectedChannel(channelName); // optional: store in state
    setActiveTab(null); // exit tab mode when a channel is selected
    setSelectedCategory(null);
     processChannelCategories(channelName);
   
    console.log("Processed categories for channel:", channelName);
    console.log("Categories set to:", categories);

    fetchChannelArticles(channelName);
  };

  const handleTabChangeFromFeed = async (tabName) => {
    console.log("Parent knows active tab:", tabName);
    setActiveTab(tabName);
    setSelectedChannel(null); // exit channel mode
    setCategories([...defaultCategories]);
    setSelectedCategory(null); // Reset selected category

    setPage(1);
    // await fetchTabArticles(tabName, 1); // fetch articles for the tab
  };




  // ──────────────────────────────────────────────
  // Channel & Category Utilities
  // ──────────────────────────────────────────────
  const processChannelCategories = (channelName) => {
    console.log("All channels:", channels);

    // Find the channel object by name
    const channel = channels.find((c) => c.name === channelName);

    if (!channel || !channel.categories?.length) {
      setCategories(null);
      setCategories([...defaultCategories]);
      setSelectedCategory(null); // Reset selected category
      return;
    }

    const mapped = channel.categories.map((cat) => ({
      id: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
      label: cat.name,
    }));
    setCategories(null);
    setCategories([...mapped]); // set new categories
    return mapped;
  };

  // fetch all channels
  const fetchChannels = async () => {
    try {
      const { data } = await channelsAPI.fetchChannels();
      setChannels(data);
    } catch (err) {
      console.error("❌ Error fetching channels:", err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data } = await bookmarksAPI.getBookmarks();
      const ids = new Set(data.map((b) => b.articleId));
      setBookmarkedArticles(ids);
    } catch (err) {
      console.error("❌ Error fetching bookmarks:", err);
    }
  };

  // ──────────────────────────────────────────────
  //  Bookmark / History Logic (unchanged)
  // ──────────────────────────────────────────────

  const handleBookmark = async (article) => {
    try {
      if (bookmarkedArticles.has(article._id)) {
        const { data } = await bookmarksAPI.getBookmarks();
        const bm = data.find((b) => b.articleId === article._id);
        if (bm) await bookmarksAPI.removeBookmark(bm._id);
        setBookmarkedArticles((prev) => {
          const copy = new Set(prev);
          copy.delete(article._id);
          return copy;
        });
      } else {
        await bookmarksAPI.addBookmark(article);
        setBookmarkedArticles((prev) => new Set([...prev, article._id]));
      }
    } catch (err) {
      console.error("❌ Bookmark error:", err);
    }
  };

  const handleReadArticle = async (article) => {
    try {
      await historyAPI.addToHistory({
        articleId: article._id,
        title: article.title,
        url: article.url,
        source: article.channel,
        category: article.category,
        readProgress: 100,
        readTime: 300,
      });
      window.open(article.url, "_blank");
    } catch (err) {
      console.error("❌ Error adding to history:", err);
    }
  };

  // ──────────────────────────────────────────────
  // Utility
  // ──────────────────────────────────────────────
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const diffH = Math.floor((Date.now() - date) / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  };

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <div className="news-page">
      {/* <ErrorAlert error={error} /> */}
      <div className="news-body">
        <aside className="news-sidebar">
          <Sidebar
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories.length ? categories : defaultCategories}
            onCategoryChange={(category) => console.log("Selected category:", category)}
          />
        </aside>

        <main className="news-main">
          <Suspense
            fallback={
              <div className="news-loading">
                <CircularProgress />
              </div>
            }
          >
            
              <NewsFeed
                selectedCategory={selectedCategory}
                newsArticles={articles}
                loading={loadingArticles}
                bookmarkedArticles={bookmarkedArticles}
                handleBookmark={handleBookmark}
                handleReadArticle={handleReadArticle}
                formatTimeAgo={formatTimeAgo}
                onTabChange={handleTabChangeFromFeed}
                onChannelChange={handleSelectedChannelChange}
              />
           
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default NewsPage;
