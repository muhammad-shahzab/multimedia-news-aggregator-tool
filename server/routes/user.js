import express from 'express';
import User from '../models/users.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

// Update preferences
router.put('/profile', authMiddleware, async (req, res) => {
  const updates = req.body.preferences;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { preferences: updates },
    { new: true }
  ).select('-password');

  res.json(user);
});

export default router;
