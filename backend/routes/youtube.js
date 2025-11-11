import express from 'express';
import { scrapeYouTubeVideos } from '../services/scrapeVideos.js';

const router = express.Router();

router.get('/videos', async (req, res) => {
  const category = req.query.category || 'for-you';

  try {
    const videos = await scrapeYouTubeVideos(category);
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

export default router;
