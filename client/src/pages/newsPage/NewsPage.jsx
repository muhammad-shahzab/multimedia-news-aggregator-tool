import { useState, useEffect, lazy, Suspense } from "react";
import { CircularProgress } from "@mui/material";
import "./NewsPage.css";

import {
  Public,
  Business,
  Sports,
  Movie,
  HealthAndSafety,
  Science,
} from "@mui/icons-material";

import {
  newsAPI,
  bookmarksAPI,
  historyAPI,
  channelsAPI,
} from "../../services/api";

import Sidebar from "../../components/global/Sidebar";
import ErrorAlert from "../../components/news/ErrorAlert";

const newsCache = {
  channels: {} // Global in-memory cache for channels
};

const NewsFeed = lazy(() => import("../../components/news/Feed/NewsFeed"));

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const defaultCategories = [
    { id: "technology", label: "Technology", icon: <Public /> },
    { id: "business", label: "Business", icon: <Business /> },
    { id: "sports", label: "Sports", icon: <Sports /> },
    { id: "entertainment", label: "Entertainment", icon: <Movie /> },
    { id: "health", label: "Health", icon: <HealthAndSafety /> },
    { id: "science", label: "Science", icon: <Science /> },
    { id: "world", label: "World News", icon: <Public /> },
  ];

  
  // INITIAL LOAD
  
  useEffect(() => {
    Promise.all([fetchChannels(), fetchBookmarks(), fetchTabArticles("Home")])
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  
  // TAB FETCH FUNCTION
  
  const fetchTabArticles = async (tabName) => {
    try {
      setLoadingArticles(true);
      let response;
      if (tabName === "Following") {
        response = await newsAPI.fetchFollowingArticles();
        setArticles(response.data.articles || []);
        setSelectedCategory(null);

        const followedCategories = response.data.favTopics || [];
        const mappedCategories = followedCategories.map((topic) => ({
          id: topic.toLowerCase().replace(/\s+/g, "-"),
          label: topic,
        }));

        setCategories(mappedCategories);
      } else if (tabName === "Home") {
        response = await newsAPI.fetchPersonalizedArticles();
        setArticles(response.data.data || []);
      } else if (tabName === "Headlines") {
        response = await newsAPI.fetchArticlesLatest();
        setArticles(response.data.data || []);
      } else {
        setError("Failed to fetch news");
      }
    } catch (err) {
      console.error(" Error fetching news:", err);
      setError("Failed to fetch news");
    } finally {
      setLoadingArticles(false);
    }
  };

  
  // CHANNEL FETCH FUNCTION WITH CACHE
  
  const fetchChannelArticlesCached = async (channelName) => {
    const cache = newsCache.channels[channelName];

    // Use cached data if < 10 minutes old
    if (cache && Date.now() - cache.timestamp < 10 * 60 * 1000) {
      console.log(` Using cached articles for channel: ${channelName}`);
      setArticles(cache.data);
      return cache.data;
    }

    setLoadingArticles(true);
    try {
      const response = await channelsAPI.fetchNewsByChannel(channelName);
      const fetchedArticles = response.data.data || [];

      // Save to cache
      newsCache.channels[channelName] = {
        data: fetchedArticles,
        timestamp: Date.now(),
      };

      setArticles(fetchedArticles);
      return fetchedArticles;
    } catch (err) {
      console.error(" Error fetching channel news:", err);
      setError("Failed to fetch news");
      setArticles([]);
      return [];
    } finally {
      setLoadingArticles(false);
    }
  };

  
  // CHANNEL / TAB SELECTION
  
  const handleSelectedChannelChange = (channelName) => {
    setSelectedChannel(channelName);
    setActiveTab(null);
    setSelectedCategory(null);
    setArticles([]);
    processChannelCategories(channelName);

    fetchChannelArticlesCached(channelName); // Use cached fetch
  };

  const handleTabChangeFromFeed = (tabName) => {
    setActiveTab(tabName);
    setSelectedChannel(null);
    setCategories([...defaultCategories]);
    setSelectedCategory(null);

    fetchTabArticles(tabName);
  };

  
  // PROCESS CHANNEL CATEGORIES
  
  const processChannelCategories = (channelName) => {
    const channel = channels.find((c) => c.name === channelName);

    if (!channel || !channel.categories?.length) {
      setCategories([...defaultCategories]);
      setSelectedCategory(null);
      return;
    }

    const mapped = channel.categories.map((cat) => ({
      id: cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-"),
      label: cat.name,
    }));

    setCategories(mapped);
    return mapped;
  };

  
  // FETCH CHANNELS & BOOKMARKS
  
  const fetchChannels = async () => {
    try {
      const { data } = await channelsAPI.fetchChannels();
      setChannels(data);
    } catch (err) {
      console.error(" Error fetching channels:", err);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data } = await bookmarksAPI.getBookmarks();
      const ids = new Set(data.map((b) => b.articleId));
      setBookmarkedArticles(ids);
    } catch (err) {
      console.error(" Error fetching bookmarks:", err);
    }
  };

  
  // HANDLE READ ARTICLE
  
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
      console.error(" Error adding to history:", err);
    }
  };

  
  // TIME AGO UTILITY
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return "week ago";
  };

  
  // RENDER
  
  return (
    <div className="news-page">
      <div className="news-body">
        <aside className="news-sidebar">
          <Sidebar
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories.length ? categories : defaultCategories}
            onCategoryChange={(category) =>
              console.log("Selected category:", category)
            }
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
