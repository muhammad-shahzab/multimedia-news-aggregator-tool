import express from "express"
import Bookmark from "../models/Bookmark.js"
import authMiddleware from "../middleware/authMiddleware.js"

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
    const { articleId, title, url, source, category, image, summary, tags } = req.body

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      userId: req.userId,
      articleId,
    })

    if (existingBookmark) {
      return res.status(400).json({ message: "Article already bookmarked" })
    }

    const bookmark = new Bookmark({
      userId: req.userId,
      articleId,
      title,
      url,
      source,
      category,
      image,
      summary,
      tags,
    })

    await bookmark.save()
    res.status(201).json(bookmark)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Remove bookmark
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Bookmark.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    })
    res.json({ message: "Bookmark removed" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router