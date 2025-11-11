// guardian-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

// ✅ Guardian feeds (official sources)
const feeds = {
  TopStories: "https://www.theguardian.com/international/rss",
  World: "https://www.theguardian.com/world/rss",
  UK: "https://www.theguardian.com/uk/rss",
  US: "https://www.theguardian.com/us/rss",
  Australia: "https://www.theguardian.com/australia-news/rss",
  Europe: "https://www.theguardian.com/world/europe-news/rss",
  Business: "https://www.theguardian.com/business/rss",
  Technology: "https://www.theguardian.com/technology/rss",
  Science: "https://www.theguardian.com/science/rss",
  Environment: "https://www.theguardian.com/environment/rss",
  Sport: "https://www.theguardian.com/sport/rss",
  Football: "https://www.theguardian.com/football/rss",
  Culture: "https://www.theguardian.com/culture/rss",
  Books: "https://www.theguardian.com/books/rss",
  Film: "https://www.theguardian.com/film/rss",
  Music: "https://www.theguardian.com/music/rss",
  Opinion: "https://www.theguardian.com/commentisfree/rss",
  Lifestyle: "https://www.theguardian.com/lifeandstyle/rss",
  Fashion: "https://www.theguardian.com/fashion/rss",
  Food: "https://www.theguardian.com/food/rss",
};

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["content:encoded", "fullContent"],
      ["enclosure", "enclosure"],
    ],
  },
});

// ✅ Precompiled regex (avoid recreation)
const IMG_REGEX = /<img[^>]+src=["']([^"']+)["']/i;
const VIDEO_REGEX = /https?:\/\/[^\s"']+\.(mp4|m3u8)/i;

// ✅ Media extractor
function extractMedia(item) {
  let imageUrl = null;
  let videoUrl = null;
  let audioUrl = null;

  // 1. media:content (Guardian style)
  if (Array.isArray(item.mediaContent)) {
    for (const m of item.mediaContent) {
      const url = m.url || (m.$ && m.$.url);
      const width = m.width || (m.$ && m.$.width);
      const medium = m.medium || (m.$ && m.$.medium) || "";

      if (!url) continue;

      if (!imageUrl && (/image/i.test(medium) || width)) {
        imageUrl = url;
      }
      if (!videoUrl && /video/i.test(medium)) {
        videoUrl = url;
      }
      if (!audioUrl && /audio/i.test(medium)) {
        audioUrl = url;
      }
    }
  }

  // 2. enclosure
  if (item.enclosure?.url) {
    const type = item.enclosure.type || "";
    if (!imageUrl && /image/i.test(type)) imageUrl = item.enclosure.url;
    if (!videoUrl && /video/i.test(type)) videoUrl = item.enclosure.url;
    if (!audioUrl && /audio/i.test(type)) audioUrl = item.enclosure.url;
  }

  // 3. media:thumbnail
  if (!imageUrl && Array.isArray(item.mediaThumbnail) && item.mediaThumbnail[0]) {
    const thumb = item.mediaThumbnail[0];
    imageUrl = thumb.url || (thumb.$ && thumb.$.url) || imageUrl;
  }

  // 4. Fallback: <img> in content/description
  const contentBlock = item.fullContent || item.content || item.description || "";
  const imgMatch = contentBlock.match(IMG_REGEX);
  if (!imageUrl && imgMatch) imageUrl = imgMatch[1];

  // 5. Inline video links
  if (!videoUrl) {
    const vmatch = (item.fullContent || item.contentSnippet || "").match(VIDEO_REGEX);
    if (vmatch) videoUrl = vmatch[0];
  }

  return { imageUrl, videoUrl, audioUrl };
}


// ✅ Ensure Guardian channel exists
async function ensureGuardianChannel() {
  let channel = await Channel.findOne({ name: "The Guardian" });

  if (!channel) {
    channel = new Channel({
      name: "The Guardian",
      
      categories: Object.entries(feeds).map(([name, rss]) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        rss,
      })),
    });
  } else {
    const existing = new Set(channel.categories.map((c) => c.name));
    for (const [name, rss] of Object.entries(feeds)) {
      if (!existing.has(name)) {
        channel.categories.push({ name, slug: name.toLowerCase().replace(/\s+/g, "-"), rss });
      } else {
        const cat = channel.categories.find((c) => c.name === name);
        if (cat && !cat.rss) cat.rss = rss;
      }
    }
  }

  await channel.save();
  return channel;
}

// ✅ Safe text helper
function safeText(input) {
  if (!input) return "";
  if (Array.isArray(input)) return input.join(" ");
  if (typeof input === "object") return JSON.stringify(input);
  return String(input);
}

// ✅ Fetch & normalize one feed
async function fetchGuardianFeed(feedName, url) {
  try {
    const feed = await parser.parseURL(url);

    return (feed.items || []).map((item) => {
      const { imageUrl, videoUrl, audioUrl } = extractMedia(item);

      const rawTitle = safeText(item.title);
      const rawSummary = safeText(item.contentSnippet);
      const rawContent = safeText(item.fullContent || item.contentSnippet);

      return {
        title: he.decode(rawTitle).trim(),
        summary: he.decode(rawSummary).trim(),
        content: he.decode(rawContent).trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: imageUrl || null,
        mediaUrl: audioUrl || videoUrl || null,
        isVideo: Boolean(videoUrl),
        tags: item.categories?.map((c) => he.decode(safeText(c)).trim()) || [feedName],
        channel: "The Guardian",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName} (${url}):`, err.message);
    return [];
  }
}

// ✅ Fetch all feeds & save
export async function fetchAndSaveGuardianFeeds() {
  console.log("\n📡 Fetching Guardian feeds...");

  const channel = await ensureGuardianChannel();

  await Promise.all(
    Object.entries(feeds).map(async ([feedName, url]) => {
      const items = await fetchGuardianFeed(feedName, url);

      if (!items.length) {
        console.log(`   ⚠️ No articles for ${feedName}`);
        return;
      }

      try {
        await Article.deleteMany({ channel: channel.name, category: feedName });
        await Article.insertMany(items, { ordered: false });
        console.log(`   ✅ Saved ${items.length} articles for ${feedName}`);
      } catch (err) {
        if (err.code !== 11000) {
          console.error(`❌ insertMany error for ${feedName}:`, err.message);
        }
      }
    })
  );

  console.log("\n✅ Guardian feeds processed");
}
