// espn-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

// ✅ ESPN RSS feeds (https://www.espn.com/espn/rss)
const feeds = {
  TopNews: "https://www.espn.com/espn/rss/news",
  NFL: "https://www.espn.com/espn/rss/nfl/news",
  NBA: "https://www.espn.com/espn/rss/nba/news",
  MLB: "https://www.espn.com/espn/rss/mlb/news",
  NHL: "https://www.espn.com/espn/rss/nhl/news",
  Soccer: "https://www.espn.com/espn/rss/soccer/news",
  Tennis: "https://www.espn.com/espn/rss/tennis/news",
  Golf: "https://www.espn.com/espn/rss/golf/news",
  Boxing: "https://www.espn.com/espn/rss/boxing/news",
  MMA: "https://www.espn.com/espn/rss/mma/news",
  FantasySports: "https://www.espn.com/espn/rss/fantasy/news",
};


const parser = new Parser({
  customFields: {
    item: [
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["media:content", "mediaContent", { keepArray: true }],
      ["content:encoded", "fullContent"],
      ["enclosure", "enclosure"],
    ],
  },
});

// ✅ Extract media 
function extractMedia(item) {
  let imageUrl = null;

  // 1️⃣ Check mediaContent
  if (item.mediaContent?.length) {
    for (const m of item.mediaContent) {
      const url = m.$?.url || m.url;
      const medium = m.$?.medium || "";
      if (url && /image/i.test(medium)) {
        imageUrl = url;
        break;
      }
    }
  }

  // 2️⃣ Check mediaThumbnail
  if (!imageUrl && item.mediaThumbnail?.length) {
    const thumb = item.mediaThumbnail[0];
    if (thumb.$?.url) imageUrl = thumb.$.url;
  }

  // 3️⃣ Check enclosure
  if (!imageUrl && item.enclosure?.url && /image/i.test(item.enclosure.type || "")) {
    imageUrl = item.enclosure.url;
  }

  // 4️⃣ Check first <img> in fullContent
  if (!imageUrl && item.fullContent) {
    const match = item.fullContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) imageUrl = match[1];
  }

  // ✅ No fallback, imageUrl remains null if nothing found
  return { imageUrl };
}


// ✅ Ensure ESPN channel + categories exist
async function ensureESPNChannel() {
  let channel = await Channel.findOne({ name: "ESPN" });

  if (!channel) {
    channel = new Channel({
      name: "ESPN",
      categories: Object.keys(feeds).map((name) => ({
        name,
        slug: name.toLowerCase(),
        rss: feeds[name],
      })),
    });
    await channel.save();
  } else {
    const existing = new Set(channel.categories.map((c) => c.name));
    for (const name of Object.keys(feeds)) {
      if (!existing.has(name)) {
        channel.categories.push({
          name,
          slug: name.toLowerCase(),
          rss: feeds[name],
        });
      }
    }
    await channel.save();
  }

  return channel;
}

// ✅ Fetch + normalize one feed
async function fetchESPNFeed(feedName, url) {
  try {
    const feed = await parser.parseURL(url);

    return (feed.items || []).map((item) => {
      const { imageUrl } = extractMedia(item);

      return {
        title: he.decode(item.title || "").trim(),
        summary: he.decode(item.contentSnippet || "").trim(),
        content: he.decode(item.fullContent || item.contentSnippet || "").trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: imageUrl,
        mediaUrl: null,
        isVideo: false,
        tags: item.categories ? item.categories.map((c) => he.decode(c).trim()) : [feedName],
        channel: "ESPN",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName}:`, err.message);
    return [];
  }
}

// ✅ Fetch all ESPN feeds in parallel
export async function fetchAndSaveESPNFeeds() {
  console.log("\n📡 Fetching all ESPN feeds...");

  const channel = await ensureESPNChannel();

  await Promise.all(
    Object.entries(feeds).map(async ([feedName, url]) => {
      const items = await fetchESPNFeed(feedName, url);

      if (items.length > 0) {
        await Article.deleteMany({ channel: channel.name, category: feedName });
        try {
          await Article.insertMany(items, { ordered: false });
        } catch (err) {
          if (err.code !== 11000) console.error(`❌ insertMany error:`, err.message);
        }
        console.log(`   ✅ Saved ${items.length} articles for ${feedName}`);
      } else {
        console.log(`   ⚠️ No articles fetched for ${feedName}`);
      }
    })
  );

  console.log("\n✅ All ESPN feeds processed");
}
