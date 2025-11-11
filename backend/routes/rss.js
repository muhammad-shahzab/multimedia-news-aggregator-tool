import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getPersonalizedArticles,
  getFollowingArticles,
  getLatestArticles,
} from "../controllers/feedController.js";

const router = express.Router();

// Home tab → Personalized
router.get("/personalized", authMiddleware, getPersonalizedArticles);

// Following tab → Fav topics
router.get("/following", authMiddleware, getFollowingArticles);

// Headlines tab → Latest
router.get("/latest", getLatestArticles);

export default router;