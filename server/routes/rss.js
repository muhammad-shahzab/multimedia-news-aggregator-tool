import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/users.js";
import { fetchPersonalizedRSS } from "../services/rssService.js";

const router = express.Router();

router.get("/rssfeed", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const preferences = user.preferences;

    const articles = await fetchPersonalizedRSS(preferences);

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching RSS news." });
  }
});

export default router;
