import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/users.js';
import { toggleFavTopic, isFavTopic, toggleFavChannel, isFavChannel ,addFavTags } from '../controllers/userController.js';

const router = express.Router();

// -------------------- PROFILE --------------------

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user preferences (topics, regions, languages, favTags)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body.preferences;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { preferences: updates },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// TOPICS
router.post("/topic/toggle", authMiddleware, toggleFavTopic);
router.get("/topic/check", authMiddleware, isFavTopic);

// CHANNELS
router.post("/channel/toggle", authMiddleware, toggleFavChannel);
router.get("/channel/check", authMiddleware, isFavChannel);

// USER ROUTES
router.post("/like/add-tags", authMiddleware, addFavTags);

export default router;
