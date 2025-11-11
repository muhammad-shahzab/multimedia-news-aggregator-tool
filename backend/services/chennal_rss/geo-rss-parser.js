// geo-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

// ✅ Geo News RSS feeds
const feeds = {
  TopStories: "https://www.geo.tv/rss/1/0",
  Pakistan: "https://www.geo.tv/rss/2/0",
  World: "https://www.geo.tv/rss/3/0",
  Sports: "https://www.geo.tv/rss/4/0",
  Entertainment: "https://www.geo.tv/rss/5/0",
  Business: "https://www.geo.tv/rss/6/0",
  Health: "https://www.geo.tv/rss/7/0",
  Amazing: "https://www.geo.tv/rss/8/0",
  Lifestyle: "https://www.geo.tv/rss/9/0",
  Technology: "https://www.geo.tv/rss/10/0"
};;


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

// ✅ Improved media extraction
function extractMedia(item) {
  let imageUrl = null;

  // 1. media:content (larger images/videos)
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

  // 2. media:thumbnail
  if (!imageUrl && item.mediaThumbnail?.length) {
    const thumb = item.mediaThumbnail[0];
    if (thumb.$?.url) imageUrl = thumb.$.url;
  }

  // 3. enclosure
  if (!imageUrl && item.enclosure?.url && /image/i.test(item.enclosure.type || "")) {
    imageUrl = item.enclosure.url;
  }

  // 4. Look inside fullContent
  if (!imageUrl && item.fullContent) {
    const imgMatch = item.fullContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) imageUrl = imgMatch[1];
  }

  // 5. Look inside description/content
  if (!imageUrl && item.content) {
    const descMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (descMatch) imageUrl = descMatch[1];
  }

  // 6. Fallback to Geo logo
  if (!imageUrl) {
    imageUrl = "https://www.geo.tv/assets/front/images/geo-logo.png";
  }

  return { imageUrl };
}

// ✅ Ensure Geo channel + categories exist
async function ensureGeoChannel() {
  let channel = await Channel.findOne({ name: "Geo News" });

  if (!channel) {
    channel = new Channel({
      name: "Geo News",
      language: "ur",
      region: "Pakistan",
      parser: "geo",
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
async function fetchGeoFeed(feedName, url) {
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
        image: imageUrl, // ✅ improved extraction but same schema
        mediaUrl: null,  // ✅ untouched schema
        isVideo: false,  // ✅ untouched schema
        tags: item.categories ? item.categories.map((c) => he.decode(c).trim()) : [feedName],
        channel: "Geo News",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName}:`, err.message);
    return [];
  }
}

// ✅ Fetch all Geo feeds in parallel
export async function fetchAndSaveGeoFeeds() {
  console.log("\n📡 Fetching all Geo News feeds...");

  const channel = await ensureGeoChannel();

  await Promise.all(
    Object.entries(feeds).map(async ([feedName, url]) => {
      const items = await fetchGeoFeed(feedName, url);

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

  console.log("\n✅ All Geo News feeds processed");
}
