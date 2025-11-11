// parsers/jang-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

const feeds = {
  TopStories: "https://jang.com.pk/rss/1/1",
  Latest: "https://jang.com.pk/rss/1/2",
  Pakistan: "https://jang.com.pk/rss/1/3",
  World: "https://jang.com.pk/rss/1/4",
  Business: "https://jang.com.pk/rss/1/5",
  Sports: "https://jang.com.pk/rss/1/6",
  Entertainment: "https://jang.com.pk/rss/1/7",
  Health: "https://jang.com.pk/rss/1/8"
};

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["content:encoded", "fullContent"],
      ["enclosure", "enclosure"]
    ]
  }
});

// ✅ Media extractor
function extractMedia(item) {
  let imageUrl = null, videoUrl = null;

  // 1. media:content
  if (Array.isArray(item.mediaContent)) {
    for (const m of item.mediaContent) {
      const url = m.$?.url || m.url;
      const medium = m.$?.medium || "";
      if (!url) continue;

      if (!imageUrl && (/image/i.test(medium) || m.width)) imageUrl = url;
      if (!videoUrl && /video/i.test(medium)) videoUrl = url;
    }
  }

  // 2. media:thumbnail
  if (!imageUrl && Array.isArray(item.mediaThumbnail)) {
    const thumb = item.mediaThumbnail[0];
    imageUrl = thumb.$?.url || thumb.url || imageUrl;
  }

  // 3. enclosure
  if (item.enclosure?.url) {
    const type = item.enclosure.type || "";
    if (!imageUrl && /image/i.test(type)) imageUrl = item.enclosure.url;
    if (!videoUrl && /video/i.test(type)) videoUrl = item.enclosure.url;
  }

  // 4. Inline content
  const contentBlock = item.fullContent || item.content || item.description || "";
  if (!imageUrl) {
    const imgMatch = contentBlock.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) imageUrl = imgMatch[1];
  }
  if (!videoUrl) {
    const vidMatch = contentBlock.match(/<video[^>]+src=["']([^"']+)["']/i);
    if (vidMatch) videoUrl = vidMatch[1];
    const mp4Match = contentBlock.match(/https?:\/\/[^\s"']+\.mp4/i);
    if (mp4Match) videoUrl = mp4Match[0];
  }

  return { imageUrl, videoUrl };
}

// ✅ Ensure channel + categories
async function ensureJangChannel() {
  let channel = await Channel.findOne({ name: "Jang" });

  if (!channel) {
    channel = new Channel({
      name: "Jang",
      categories: Object.keys(feeds).map((name) => ({
        name,
        slug: name.toLowerCase(),
        rss: feeds[name]
      }))
    });
  } else {
    const existing = new Set(channel.categories.map((c) => c.name));
    for (const name of Object.keys(feeds)) {
      if (!existing.has(name)) {
        channel.categories.push({
          name,
          slug: name.toLowerCase(),
          rss: feeds[name]
        });
      }
    }
  }

  await channel.save();
  return channel;
}

// ✅ Fetch one feed
async function fetchJangFeed(feedName, url) {
  try {
    const feed = await parser.parseURL(url);

    return (feed.items || []).map((item) => {
      const { imageUrl, videoUrl } = extractMedia(item);

      return {
        title: he.decode(item.title || "").trim(),
        summary: he.decode(item.contentSnippet || "").trim(),
        content: he.decode(item.fullContent || item.contentSnippet || "").trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: imageUrl || null,
        mediaUrl: videoUrl || null,
        isVideo: Boolean(videoUrl),
        tags: item.categories ? item.categories.map((c) => he.decode(c).trim()) : [feedName],
        channel: "Jang",
        category: feedName
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName}:`, err.message);
    return [];
  }
}

// ✅ Fetch + save all feeds
export async function fetchAndSaveJangFeeds() {
  console.log("\n📡 Fetching all Jang feeds...");

  const channel = await ensureJangChannel();

  for (const [feedName, url] of Object.entries(feeds)) {
    const items = await fetchJangFeed(feedName, url);

    if (!items.length) {
      console.log(`   ⚠️ No articles for ${feedName}`);
      continue;
    }

    try {
      // Upsert instead of delete+insert
      const ops = items.map((doc) => ({
        replaceOne: {
          filter: { url: doc.url },
          replacement: doc,
          upsert: true
        }
      }));
      await Article.bulkWrite(ops, { ordered: false });
      console.log(`   ✅ Saved/Updated ${items.length} articles for ${feedName}`);
    } catch (err) {
      console.error(`❌ bulkWrite error for ${feedName}:`, err.message);
    }
  }

  console.log("\n✅ All Jang feeds processed");
}
