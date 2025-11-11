import User from "../models/users.js"; 

// -------------------- TOPICS --------------------

// Toggle favorite topic
export const toggleFavTopic = async (req, res) => {
  try {
    const userId = req.userId;
    const { topic } = req.body;

    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let favTopics = user.preferences.topics || [];

    if (favTopics.includes(topic)) {
      favTopics = favTopics.filter((t) => t !== topic);
    } else {
      favTopics.push(topic);
    }

    user.preferences.topics = favTopics;
    await user.save();

    // Send boolean instead of array
    res.status(200).json({ fav: favTopics.includes(topic) });
  } catch (err) {
    console.error("toggleFavTopic error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if topic is favorite
export const isFavTopic = async (req, res) => {
  try {
    const userId = req.userId;
    const topic = req.query.topic;

    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fav = (user.preferences.topics || []).includes(topic);
    res.status(200).json({ fav });
  } catch (err) {
    console.error("isFavTopic error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CHANNELS --------------------

// Toggle favorite channel
export const toggleFavChannel = async (req, res) => {
  try {
    const userId = req.userId;
    const { channel } = req.body;

    if (!channel) return res.status(400).json({ message: "Channel is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let favChannels = user.preferences.favChannel || [];

    if (favChannels.includes(channel)) {
      favChannels = favChannels.filter((c) => c !== channel);
    } else {
      favChannels.push(channel);
    }

    user.preferences.favChannel = favChannels;
    await user.save();

    // Send boolean instead of array
    res.status(200).json({ fav: favChannels.includes(channel) });
  } catch (err) {
    console.error("toggleFavChannel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if channel is favorite
export const isFavChannel = async (req, res) => {
  try {
    const userId = req.userId;
    const channel = req.query.channel;

    if (!channel) return res.status(400).json({ message: "Channel is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const fav = (user.preferences.favChannel || []).includes(channel);
    res.status(200).json({ fav });
  } catch (err) {
    console.error("isFavChannel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
