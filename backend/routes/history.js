import express from "express"
import ReadingHistory from "../models/ReadingHistory.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Get reading history
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { timeframe } = req.query
    let dateFilter = {}

    if (timeframe === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateFilter = { createdAt: { $gte: today } }
    } else if (timeframe === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = { createdAt: { $gte: weekAgo } }
    } else if (timeframe === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFilter = { createdAt: { $gte: monthAgo } }
    }

    const history = await ReadingHistory.find({
      userId: req.userId,
      ...dateFilter,
    }).sort({ createdAt: -1 })

    res.json(history)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

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

    const totalReadTimeResult = await ReadingHistory.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: null, totalTime: { $sum: "$readTime" } } },
    ])

    const totalReadTime = totalReadTimeResult[0]?.totalTime || 0

    res.json({
      totalArticles,
      completedArticles,
      totalReadTime: Math.round(totalReadTime / 60), // Convert to minutes
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router