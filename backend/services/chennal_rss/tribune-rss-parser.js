
// tribune-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

// ✅ Define Tribune feeds
const feeds = {
  "Latest": "https://tribune.com.pk/feed/latest",
  "Analysis": "https://tribune.com.pk/feed/analysis",
  "Politics": "https://tribune.com.pk/feed/politics",
  "Cricket": "https://tribune.com.pk/feed/cricket",
  "Movies": "https://tribune.com.pk/feed/movies",
  "Health": "https://tribune.com.pk/feed/health",
  "Style": "https://tribune.com.pk/feed/style",
  "Pakistan": "https://tribune.com.pk/feed/pakistan",
  "Sindh": "https://tribune.com.pk/feed/sindh",
  "Punjab": "https://tribune.com.pk/feed/punjab",
  "Balochistan": "https://tribune.com.pk/feed/balochistan",
  "K-P": "https://tribune.com.pk/feed/k-p",
  "Jammu Kashmir": "https://tribune.com.pk/feed/jammu-kashmir",
  "Gilgit Baltistan": "https://tribune.com.pk/feed/gilgit-baltistan",
  "Business": "https://tribune.com.pk/feed/business",
  "World": "https://tribune.com.pk/feed/world",
  "Sports": "https://tribune.com.pk/feed/sports",
  "Technology": "https://tribune.com.pk/feed/technology",
  "Games": "https://tribune.com.pk/feed/games",
  "Gadget": "https://tribune.com.pk/feed/gadget",
  "Life Style": "https://tribune.com.pk/feed/life-style",
  "Art and Books": "https://tribune.com.pk/feed/art-and-books",
  "Music": "https://tribune.com.pk/feed/music",
  "Film": "https://tribune.com.pk/feed/film",
  "Fashion": "https://tribune.com.pk/feed/fashion",
  "Gossip": "https://tribune.com.pk/feed/gossip",
  "TV": "https://tribune.com.pk/feed/tv",
  "Theatre": "https://tribune.com.pk/feed/theatre",
  "Entertainment": "https://tribune.com.pk/feed/entertainment",
};

// ✅ RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ["dc:creator", "creator"],
      ["content:encoded", "fullContent"],
      ["image", "image", { keepArray: true }],
    ],
  },
});

// ✅ Extract media from Tribune items
function extractMedia(item) {
  let imageUrl = null;

  if (item.image && item.image.length) {
    const raw = item.image[0];
    if (typeof raw === "string") {
      const match = raw.match(/<img[^>]+src=["'](.+?)["']/i);
      if (match) imageUrl = match[1];
    } else if (raw.img && Array.isArray(raw.img)) {
      if (raw.img[0].$?.src) imageUrl = raw.img[0].$.src;
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

  return { imageUrl };
}

// ✅ Ensure Tribune channel + categories exist
async function ensureTribuneChannel() {
  let channel = await Channel.findOne({ name: "Tribune" });

  if (!channel) {
    channel = new Channel({
      name: "Tribune",
      categories: Object.keys(feeds).map((name) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
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
async function fetchTribuneFeed(feedName, url) {
  try {
    const feed = await parser.parseURL(url);

    return feed.items.map((item) => {
      const { imageUrl } = extractMedia(item);

      return {
        title: he.decode(item.title || "").trim(),
        summary: he.decode(item.contentSnippet || "").trim(),
        content: he.decode(item.fullContent || item.contentSnippet || "").trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: imageUrl,
        tags: [feedName],
        channel: "Tribune",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName}:`, err.message);
    return [];
  }
}

// ✅ Fetch all feeds and save to DB
export async function fetchAndSaveTribuneFeeds() {
  console.log("\n📡 Fetching all Tribune feeds in parallel...");

  const channel = await ensureTribuneChannel();

  await Promise.all(
    Object.entries(feeds).map(async ([feedName, url]) => {
      const items = await fetchTribuneFeed(feedName, url);

      if (items.length > 0) {
        await Article.deleteMany({ channel: channel.name, category: feedName });
        await Article.insertMany(items);

        console.log(`   ✅ Saved ${items.length} articles for ${feedName}`);
      } else {
        console.log(`   ⚠️ No articles fetched for ${feedName}`);
      }
    })
  );

  console.log("\n✅ All Tribune feeds processed");
}
