import express from "express";
import getRSSNews from "../services/rssService.js";
import scrapeVideos from "../services/scrapeVideos.js";

const router = express.Router();

router.get("/mixed-news", async (req, res) => {
  try {
    const rssNews = await getRSSNews(); // Article list
    const videoNews = await scrapeVideos(); // Video list

    const taggedArticles = rssNews.map((item) => ({
      ...item,
      type: "article",
    }));

    const taggedVideos = videoNews.map((item) => ({
      ...item,
      type: "video",
    }));

    const mixed = [];
    let articleIndex = 0;
    let videoIndex = 0;

    while (articleIndex < taggedArticles.length || videoIndex < taggedVideos.length) {
      // Add two articles
      for (let i = 0; i < 2 && articleIndex < taggedArticles.length; i++) {
        mixed.push(taggedArticles[articleIndex++]);
      }

      // Add one video if available
      if (videoIndex < taggedVideos.length) {
        mixed.push(taggedVideos[videoIndex++]);
      }
    }

    res.json(mixed);
  } catch (err) {
    console.error("Error getting mixed news", err);
    res.status(500).json({ error: "Failed to fetch mixed news" });
  }
});


export default router;
