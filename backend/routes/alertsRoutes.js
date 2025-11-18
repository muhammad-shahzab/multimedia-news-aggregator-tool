import express from "express";
import { Article } from "../models/Article.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const Alerts = await Article.aggregate([
      { $match: { isVideo: true } },            // only videos
      { $sort: { publishedAt: -1 } },           // newest first
      {
        $group: {
          _id: "$channel",                      // group by channel
          doc: { $first: "$$ROOT" },            // pick the latest from each channel
        },
      },
      { $replaceRoot: { newRoot: "$doc" } },    // replace root with article
      { $limit: 5 },                             // get up to 5 articles
      { $project: { title: 1, url: 1 } },       // only send title + url
    ]);

    res.status(200).json(Alerts);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

export default router;
