import { Channel } from "../models/Channel.js";


export const getAllChannels = async (req, res) => {
  try {
    const channels = await Channel.find();
    res.status(200).json(channels);
    console.log("Channels fetched successfully");
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ message: "Server error fetching channels" });
  }
};

import { Article } from "../models/Article.js";
import {shuffleAndDeduplicateArticles} from "../services/utils/shuffleAndDeduplicate.js";



//  Get paginated articles for a specific channel
export const getArticlesByChannel = async (req, res) => {
  try {
    const { channelName } = req.params;
   
    console.log("Fetching articles for channel:", channelName);

    // Find channel by name
    const channel = await Channel.findOne({ name: channelName });
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Count total articles
    const totalArticles = await Article.countDocuments({ channel: channel.name });

    const articles = await Article.find({ channel: channel.name }).sort({ publishedAt: -1 }) // latest first

    if (!articles.length) {
      return res.status(404).json({ message: "No articles found for this channel" });
    }
    const uniqueArticles=shuffleAndDeduplicateArticles(articles);

    res.status(200).json({
      totalArticles,
      data: uniqueArticles,
    });

    console.log(`Fetched ${articles.length} articles for channel: ${channelName}`);
  } catch (error) {
    console.error("Error fetching articles by channel:", error);
    res.status(500).json({ message: "Server error while fetching articles" });
  }
};