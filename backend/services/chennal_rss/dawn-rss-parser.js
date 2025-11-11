import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

// ✅ Dawn RSS feeds
const feeds = {
  TopStories: "https://www.dawn.com/feed",
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

// ✅ Extract media (image + video iframe)
function extractMedia(item) {
  let imageUrl = null;
  let mediaUrl = null;
  let isVideo = false;

  // Step 1: Prefer media:content
  if (item.mediaContent?.length) {
    for (const m of item.mediaContent) {
      const url = m.$?.url || m.url;
      const type = m.$?.type || "";
      const medium = m.$?.medium || "";

      if (url && /image/i.test(type + medium)) {
        imageUrl = url;
        break;
      }
    }
  }

  // Step 2: Fallback to media:thumbnail
  if (!imageUrl && item.mediaThumbnail?.length) {
    const thumb = item.mediaThumbnail[0];
    if (thumb.$?.url) imageUrl = thumb.$.url;
  }

  // Step 3: Fallback to enclosure
  if (!imageUrl && item.enclosure?.url && /image/i.test(item.enclosure.type || "")) {
    imageUrl = item.enclosure.url;
  }

  // Step 4: Fallback to <img> inside content
  if (!imageUrl && item.fullContent) {
    const match = item.fullContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) imageUrl = match[1];
  }

  // Step 5: Detect iframe (treat as video embed)
  if (item.fullContent || item.description) {
    const html = item.fullContent || item.description;
    const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      mediaUrl = iframeMatch[1];
      isVideo = true;
    }
  }

  return { imageUrl, mediaUrl, isVideo };
}

// ✅ Ensure Dawn channel + categories exist
async function ensureDawnChannel() {
  let channel = await Channel.findOne({ name: "Dawn" });

  if (!channel) {
    channel = new Channel({
      name: "Dawn",
      language: "en",
      region: "Pakistan",
      parser: "dawn",
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
async function fetchDawnFeed(feedName, url) {
  try {
    const feed = await parser.parseURL(url);

    return (feed.items || []).map((item) => {
      const { imageUrl, mediaUrl, isVideo } = extractMedia(item);

      return {
        title: he.decode(item.title || "").trim(),
        summary: he.decode(item.contentSnippet || "").trim(),
        content: he.decode(item.fullContent || item.contentSnippet || "").trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: imageUrl,
        mediaUrl: mediaUrl,
        isVideo: isVideo,
        tags: item.categories ? item.categories.map((c) => he.decode(c).trim()) : [feedName],
        channel: "Dawn",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName}:`, err.message);
    return [];
  }
}

// ✅ Fetch all Dawn feeds in parallel
export async function fetchAndSaveDawnFeeds() {
  console.log("\n📡 Fetching all Dawn feeds...");

  const channel = await ensureDawnChannel();

  await Promise.all(
    Object.entries(feeds).map(async ([feedName, url]) => {
      const items = await fetchDawnFeed(feedName, url);

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

  console.log("\n✅ All Dawn feeds processed");
}
