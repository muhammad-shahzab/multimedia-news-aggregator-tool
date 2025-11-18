import express from "express"
import Bookmark from "../models/Bookmark.js"
import authMiddleware from "../middleware/authMiddleware.js"
import {Article} from "../models/Article.js";

const router = express.Router()

// Get all bookmarks for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(bookmarks)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add bookmark
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ message: "Article ID is required" });
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      userId: req.userId,
      articleId,
    });

    if (existingBookmark) {
      return res.status(400).json({ message: "Article already bookmarked" });
    }

    // Create new bookmark
    const bookmark = new Bookmark({
      userId: req.userId,
      articleId,
    });

    await bookmark.save();

    res.status(201).json({
      message: "Bookmark added successfully",
      bookmark,
    });
  } catch (err) {
    console.error("❌ Bookmark add error:", err);
    res.status(500).json({ message: err.message });
  }
});


// Remove bookmark
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({
      articleId: req.params.id,

     
    })
    res.json({ message: "Bookmark removed" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})



router.get("/articles", authMiddleware, async (req, res) => {
  try {
    // Get all bookmark documents for user
    const bookmarks = await Bookmark.find({ userId: req.userId });

    // Extract article IDs
    const articleIds = bookmarks.map((b) => b.articleId);

    // Fetch articles from Article collection
    const articles = await Article.find({ _id: { $in: articleIds } });

    res.json({ data: articles });
  } catch (err) {
    console.error("❌ Error fetching bookmarked articles:", err);
    res.status(500).json({ message: err.message });
  }
});
export default router