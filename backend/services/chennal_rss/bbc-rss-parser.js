// bbc-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

// ✅ Define BBC feeds
const feeds = {
  "Front Page": "http://feeds.bbci.co.uk/news/rss.xml",
  "World": "http://feeds.bbci.co.uk/news/world/rss.xml",
  "UK": "http://feeds.bbci.co.uk/news/uk/rss.xml",
  "Business": "http://feeds.bbci.co.uk/news/business/rss.xml",
  "Politics": "http://feeds.bbci.co.uk/news/politics/rss.xml",
  "Health": "http://feeds.bbci.co.uk/news/health/rss.xml",
  "Education": "http://feeds.bbci.co.uk/news/education/rss.xml",
  "Technology": "http://feeds.bbci.co.uk/news/technology/rss.xml",
  "Entertainment & Arts": "http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
  "Sport": "http://feeds.bbci.co.uk/sport/rss.xml",
  "Africa": "http://feeds.bbci.co.uk/news/world/africa/rss.xml",
  "Asia": "http://feeds.bbci.co.uk/news/world/asia/rss.xml",
  "Europe": "http://feeds.bbci.co.uk/news/world/europe/rss.xml",
  "Latin America": "http://feeds.bbci.co.uk/news/world/latin_america/rss.xml",
  "Middle East": "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
  "US & Canada": "http://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",
};

// ✅ RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ["dc:creator", "creator"],
      ["content:encoded", "fullContent"],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["media:content", "mediaContent", { keepArray: true }],
      ["image", "image", { keepArray: true }],
    ],
  },
});

// ✅ Extract media from BBC items
function extractMedia(item) {
  let imageUrl = null, audioUrl = null, videoUrl = null;

  if (item.mediaContent?.length) {
    for (const media of item.mediaContent) {
      if (media.$?.url) {
        if (media.$.medium === "image" && !imageUrl) imageUrl = media.$.url;
        if (media.$.medium === "audio" && !audioUrl) audioUrl = media.$.url;
        if (media.$.medium === "video" && !videoUrl) videoUrl = media.$.url;
      }
    }
  }

  if (!imageUrl && item.mediaThumbnail?.length) {
    imageUrl = item.mediaThumbnail[0].$.url || null;
  }

  if (!imageUrl && item.image?.length) {
    const raw = item.image[0];
    if (typeof raw === "string") {
      const match = raw.match(/<img[^>]+src=["'](.+?)["']/i);
      if (match) imageUrl = match[1];
    }
  }

  if (!imageUrl && item.fullContent) {
    const match = item.fullContent.match(/<img[^>]+src=["'](.+?)["']/i);
    if (match) imageUrl = match[1];
  }

  if (!imageUrl && item.description) {
    const match = item.description.match(/<img[^>]+src=["'](.+?)["']/i);
    if (match) imageUrl = match[1];
  }

  return { imageUrl, audioUrl, videoUrl };
}

// ✅ Ensure BBC channel + categories exist
async function ensureBBCChannel() {
  let channel = await Channel.findOne({ name: "BBC News" });

  if (!channel) {
    channel = new Channel({
      name: "BBC News",
     categories: Object.keys(feeds).map((name) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"), // e.g., "Science & Environment" → "science-&-environment"
      })),
    });
    await channel.save();
  } else {
    // Ensure categories are updated if missing
    const existing = new Set(channel.categories.map((c) => c.name));
    for (const name of Object.keys(feeds)) {
      if (!existing.has(name)) {
        channel.categories.push({
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
        });
      }
    }
    await channel.save();
  }

  return channel;
}

// ✅ Fetch and save one feed
async function fetchBBCFeed(feedName, url) {
  try {
    const feed = await parser.parseURL(url);

    return feed.items.map((item) => {
      const { imageUrl, audioUrl, videoUrl } = extractMedia(item);

      return {
        title: he.decode(item.title || "").trim(),
        summary: he.decode(item.contentSnippet || "").trim(),
        content: he.decode(item.fullContent || item.contentSnippet || "").trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: imageUrl,
        mediaUrl: audioUrl || videoUrl || null,
        isVideo: !!videoUrl,
        tags: [feedName],
        channel: "BBC News",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName}:`, err.message);
    return [];
  }
}

// ✅ Fetch all feeds and save to DB
export async function fetchAndSaveBBCFeeds() {
  console.log("\n📡 Fetching all BBC feeds in parallel...");

  const channel = await ensureBBCChannel();

  const results = await Promise.all(
    Object.entries(feeds).map(async ([feedName, url]) => {
      const items = await fetchBBCFeed(feedName, url);

      if (items.length > 0) {
        // Remove old articles for this feed before saving new ones
        await Article.deleteMany({ channel: channel.name, category: feedName });
        await Article.insertMany(items);

        console.log(`   ✅ Saved ${items.length} articles for ${feedName}`);
      } else {
        console.log(`   ⚠️ No articles fetched for ${feedName}`);
      }
    })
  );

  console.log("\n✅ All BBC feeds processed");
}
