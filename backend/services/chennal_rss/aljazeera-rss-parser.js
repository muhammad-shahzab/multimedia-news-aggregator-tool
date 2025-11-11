// aljazeera-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";
// ✅ Define Al Jazeera feeds
const feeds = {
  "World": "https://www.aljazeera.com/xml/rss/all.xml",
};


// ✅ RSS parser
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

// ✅ Extract media from Al Jazeera items
function extractMedia(item, channelLogo) {
  let imageUrl = null;
  let videoUrl = null;
  let audioUrl = null;

  // 1) Description images first
  if (item.description) {
    const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) imageUrl = match[1];
  }

  // 2) content:encoded images
  if (!imageUrl && item.fullContent) {
    const match = item.fullContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) imageUrl = match[1];
  }

  // 3) media:content
  if (item.mediaContent?.length) {
    for (const m of item.mediaContent) {
      const url = m.$?.url || m.url;
      const medium = m.$?.medium || "";
      if (!url) continue;
      if (!imageUrl && /image/i.test(medium)) imageUrl = url;
      if (!videoUrl && /video/i.test(medium)) videoUrl = url;
      if (!audioUrl && /audio/i.test(medium)) audioUrl = url;
    }
  }

  // 4) enclosure
  if (!imageUrl && item.enclosure?.url) {
    const t = item.enclosure.type || "";
    if (/image/i.test(t)) imageUrl = item.enclosure.url;
    if (/video/i.test(t)) videoUrl = item.enclosure.url;
    if (/audio/i.test(t)) audioUrl = item.enclosure.url;
  }

  // 5) media:thumbnail
  if (!imageUrl && item.mediaThumbnail?.length) {
    const thumb = item.mediaThumbnail[0];
    imageUrl = thumb.$?.url || thumb.url || null;
  }

  // 6) Detect video by link pattern
  if (!videoUrl && item.link.includes("/video/")) {
    videoUrl = item.link;
  }

  // 7) Fallback to channel logo
  if (!imageUrl) imageUrl = channelLogo;

  return { imageUrl, videoUrl, audioUrl };
}

// ✅ Ensure Al Jazeera channel + categories exist
async function ensureAlJazeeraChannel() {
  let channel = await Channel.findOne({ name: "Al Jazeera English" });

  if (!channel) {
    channel = new Channel({
      name: "Al Jazeera English",
      categories: Object.keys(feeds).map((name) => ({
        name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        rss: feeds[name],
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
          rss: feeds[name],
        });
      }
    }
    await channel.save();
  }

  return channel;
}

// ✅ Fetch and normalize one feed
async function fetchAlJazeeraFeed(feedName, url, channelLogo) {
  try {
    const feed = await parser.parseURL(url);

    return (feed.items || []).map((item) => {
      const { imageUrl, videoUrl, audioUrl } = extractMedia(item, channelLogo);

      return {
        title: he.decode(item.title || "").trim(),
        summary: he.decode(item.contentSnippet || "").trim(),
        content: he.decode(item.fullContent || item.contentSnippet || "").trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: imageUrl,
        mediaUrl: audioUrl || videoUrl || null,
        isVideo: !!videoUrl,
        tags: item.categories
          ? item.categories.map((c) => he.decode(c).trim().toLowerCase())
          : [feedName.toLowerCase()],
        channel: "Al Jazeera English",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName} (${url}):`, err.message);
    return [];
  }
}

// ✅ Fetch all feeds and save to DB
export async function fetchAndSaveAlJazeeraFeeds() {
  console.log("\n📡 Fetching all Al Jazeera feeds...");

  const channel = await ensureAlJazeeraChannel();

  const promises = Object.entries(feeds).map(async ([feedName, url]) => {
    const items = await fetchAlJazeeraFeed(feedName, url, channel.logo);

    if (items.length > 0) {
      await Article.deleteMany({ channel: channel.name, category: feedName });
      try {
        await Article.insertMany(items, { ordered: false });
      } catch (err) {
        if (err.code && err.code !== 11000) {
          console.error(`❌ insertMany error for ${feedName}:`, err.message);
        }
      }

      console.log(`   ✅ Saved ${items.length} articles for ${feedName}`);
    } else {
      console.log(`   ⚠️ No articles fetched for ${feedName}`);
    }
  });

  await Promise.allSettled(promises);

  console.log("\n✅ All Al Jazeera feeds processed");
}
