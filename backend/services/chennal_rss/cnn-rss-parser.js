// cnn-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

// CNN RSS feeds
const feeds = {
  "Top Stories": "http://rss.cnn.com/rss/cnn_topstories.rss",
  "World": "http://rss.cnn.com/rss/edition_world.rss",
  "Business": "http://rss.cnn.com/rss/money_latest.rss",
  "Technology": "http://rss.cnn.com/rss/cnn_tech.rss",
  "Health": "http://rss.cnn.com/rss/cnn_health.rss",
  "Entertainment": "http://rss.cnn.com/rss/cnn_showbiz.rss",
  "Travel": "http://rss.cnn.com/rss/cnn_travel.rss",
  "Sport": "http://rss.cnn.com/rss/edition_sport.rss",
  "Science": "http://rss.cnn.com/rss/edition_space.rss",
};

// Parser
const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["media:group", "mediaGroup", { keepArray: true }],   // ✅ CNN uses this
      ["content:encoded", "fullContent"],
      ["enclosure", "enclosure"],
    ],
  },
});


// Extract best image/video/audio
function extractMedia(item) {
  let imageUrl = null, videoUrl = null, audioUrl = null;

  // ✅ CNN puts images inside media:group
  if (item.mediaGroup?.length) {
    for (const group of item.mediaGroup) {
      if (group["media:content"]) {
        for (const m of group["media:content"]) {
          const url = m.$?.url || m.url;
          const type = (m.$?.medium || "").toLowerCase();
          if (type === "image" && url) imageUrl = url;
          if (type === "video" && url && !videoUrl) videoUrl = url;
          if (type === "audio" && url && !audioUrl) audioUrl = url;
        }
      }
    }
  }

  // fallback: media:content (sometimes exists)
  const media = item.mediaContent || [];
  for (const m of media) {
    const url = m.$?.url || m.url;
    const type = (m.$?.medium || "").toLowerCase();
    if (!url) continue;
    if (type === "image" && !imageUrl) imageUrl = url;
    if (type === "video" && !videoUrl) videoUrl = url;
    if (type === "audio" && !audioUrl) audioUrl = url;
  }

  // fallback: enclosure
  if (item.enclosure?.url) {
    const t = item.enclosure.type || "";
    if (!imageUrl && /image/i.test(t)) imageUrl = item.enclosure.url;
    if (!videoUrl && /video/i.test(t)) videoUrl = item.enclosure.url;
    if (!audioUrl && /audio/i.test(t)) audioUrl = item.enclosure.url;
  }

  // fallback: <img> inside description/fullContent
  if (!imageUrl && (item.fullContent || item.contentSnippet)) {
    const match = (item.fullContent || item.contentSnippet).match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) imageUrl = match[1];
  }

  return { imageUrl, videoUrl, audioUrl };
}


// Ensure CNN channel exists
async function ensureCNNChannel() {
  let channel = await Channel.findOne({ name: "CNN" });
  if (!channel) {
    channel = new Channel({
      name: "CNN",
      categories: Object.keys(feeds).map(name => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        rss: feeds[name],
      })),
    });
    await channel.save();
  }
  return channel;
}

// Fetch one feed
async function fetchCNNFeed(feedName, url) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map(item => {
      const { imageUrl, videoUrl, audioUrl } = extractMedia(item);
      return {
        title: he.decode(item.title || "").trim(),
        summary: he.decode(item.contentSnippet || "").trim(),
        content: he.decode(item.fullContent || item.contentSnippet || "").trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: imageUrl,
        mediaUrl: audioUrl || videoUrl || null,
        isVideo: !!videoUrl,
        tags: item.categories ? item.categories.map(c => he.decode(c).trim()) : [feedName],
        channel: "CNN",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName}:`, err.message);
    return [];
  }
}

// Fetch & save all CNN feeds
export async function fetchAndSaveCNNFeeds() {
  console.log("\n📡 Fetching all CNN feeds...");

  const channel = await ensureCNNChannel();

  const results = await Promise.allSettled(
    Object.entries(feeds).map(([feedName, url]) => fetchCNNFeed(feedName, url))
  );

  for (let i = 0; i < results.length; i++) {
    const feedName = Object.keys(feeds)[i];
    if (results[i].status === "fulfilled") {
      const items = results[i].value;
      if (items.length > 0) {
        // remove old articles and save new ones
        await Article.deleteMany({ channel: "CNN", category: feedName });
        try { await Article.insertMany(items, { ordered: false }); }
        catch (err) { if (err.code !== 11000) console.error(err); }
        console.log(`✅ Saved ${items.length} articles for ${feedName}`);
      } else {
        console.log(`⚠️ No articles for ${feedName}`);
      }
    } else {
      console.log(`❌ Failed to fetch ${feedName}:`, results[i].reason.message);
    }
  }

  console.log("✅ All CNN feeds processed.");
}
