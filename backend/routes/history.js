import express from "express"
import ReadingHistory from "../models/ReadingHistory.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Get reading history
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Fetch ALL history for the user — no timeframe filtering
    const history = await ReadingHistory.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Add to reading history
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { articleId, title, url, source, category, readProgress, readTime } = req.body

    // Check if already exists
    let historyItem = await ReadingHistory.findOne({
      userId: req.userId,
      articleId,
    })

    if (historyItem) {
      // Update existing
      historyItem.readProgress = readProgress
      historyItem.readTime = readTime
      if (readProgress === 100) {
        historyItem.completedAt = new Date()
      }
      await historyItem.save()
    } else {
      // Create new
      historyItem = new ReadingHistory({
        userId: req.userId,
        articleId,
        title,
        url,
        source,
        category,
        readProgress,
        readTime,
        completedAt: readProgress === 100 ? new Date() : null,
      })
      await historyItem.save()
    }

    res.json(historyItem)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get reading statistics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const totalArticles = await ReadingHistory.countDocuments({ userId: req.userId })
    const completedArticles = await ReadingHistory.countDocuments({
      userId: req.userId,
      readProgress: 100,
    })
    res.json({
      totalArticles,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await ReadingHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // ensure only owner can delete
    });

    if (!deleted) return res.status(404).json({ message: "History item not found" });

    res.json({ message: "History removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router