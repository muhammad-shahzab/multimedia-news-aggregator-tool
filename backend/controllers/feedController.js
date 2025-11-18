import User from "../models/users.js";
import { Article } from "../models/Article.js";
import { fetchPersonalizedArticles } from "../services/rssService.js";
import { Mixer } from "../services/utils/Mixer.js";

//  Home tab → Personalized articles
export const getPersonalizedArticles = async (req, res) => {
  try {
    console.log("Fetching articles for home tab");

    const user = await User.findById(req.userId);
    const preferences = user?.preferences || [];
    const articles = await fetchPersonalizedArticles(preferences);
    console.log("Personalized articles fetched:", articles.length);
    res.json({ data: articles });
  } catch (err) {
    console.error(" Error fetching personalized articles:", err);
    res.status(500).json({ message: "Error fetching personalized articles." });
  }
};

//  Following tab → Based on favorite topics

export const getFollowingArticles = async (req, res) => {
  try {
    console.log("Fetching articles for Following tab");
    //  Fetch the authenticated user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Extract and clean favorite topics and channels
    const favTopics = Array.isArray(user.preferences?.topics)
      ? user.preferences.topics.filter(Boolean).map(t => t.trim())
      : [];

    const favChannels = Array.isArray(user.preferences?.favChannel)
      ? user.preferences.favChannel.filter(Boolean).map(c => c.trim())
      : [];


    //  Create unique lists
    const uniqueFavTopics = favTopics;
    const uniqueFavChannels = favChannels;
    if (uniqueFavTopics == [] || uniqueFavChannels.length == []) {
      return res.status(200).json({ favTopics: uniqueFavTopics, articles: [] });
    }


    let videoResults = [];

    for (const channel of favChannels) {
      const videos = await Article.find({
        channel: channel,
        isVideo: true
      })
        .sort({ pubDate: -1 })
        .limit(30);

      videoResults.push(...videos);
    }

     let topicArticleResults = [];

    for (const topic of favTopics) {
      const topicArticles = await Article.find({
        category: topic,
        channel: { $in: favChannels }
      })
        .sort({ pubDate: -1 })
        .limit(30);

      topicArticleResults.push(...topicArticles);
    }


     const combined = [...videoResults, ...topicArticleResults];
     const finalList = Mixer(combined);

    //  Build MongoDB query — match BOTH topic AND channel
    
  return res.status(200).json({
      favTopics,
      articles: finalList|| [],
    });


  } catch (err) {
    console.error("❌ Error fetching following articles:", err);
    res.status(500).json({ message: "Error fetching following articles." });
  }
};




// Headlines tab → Latest articles
export const getLatestArticles = async (req, res) => {
  try {
    console.log("Fetching articles for Following tab");

    // const articles = await fetchLatestArticles();
    // res.json({ data: articles });
  } catch (err) {
    console.error("❌ Error fetching latest articles:", err);
    res.status(500).json({ message: "Error fetching latest articles." });
  }
};
