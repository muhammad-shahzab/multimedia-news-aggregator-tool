// nyt-rss-parser.js
import Parser from "rss-parser";
import he from "he";
import { Article } from "../../models/Article.js";
import { Channel } from "../../models/Channel.js";

// ✅ NYT RSS feeds
const feeds = {
  Home: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  World: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
  Africa: "https://rss.nytimes.com/services/xml/rss/nyt/Africa.xml",
  Americas: "https://rss.nytimes.com/services/xml/rss/nyt/Americas.xml",
  AsiaPacific: "https://rss.nytimes.com/services/xml/rss/nyt/AsiaPacific.xml",
  Europe: "https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml",
  MiddleEast: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml",
  US: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  Education: "https://rss.nytimes.com/services/xml/rss/nyt/Education.xml",
  Politics: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
  NYRegion: "https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
  Business: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
  EnergyEnvironment: "https://rss.nytimes.com/services/xml/rss/nyt/EnergyEnvironment.xml",
  SmallBusiness: "https://rss.nytimes.com/services/xml/rss/nyt/SmallBusiness.xml",
  Economy: "https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml",
  YourMoney: "https://rss.nytimes.com/services/xml/rss/nyt/YourMoney.xml",
  Technology: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
  PersonalTech: "https://rss.nytimes.com/services/xml/rss/nyt/PersonalTech.xml",
  Baseball: "https://rss.nytimes.com/services/xml/rss/nyt/Baseball.xml",
  CollegeBasketball: "https://rss.nytimes.com/services/xml/rss/nyt/CollegeBasketball.xml",
  CollegeFootball: "https://rss.nytimes.com/services/xml/rss/nyt/CollegeFootball.xml",
  Golf: "https://rss.nytimes.com/services/xml/rss/nyt/Golf.xml",
  Hockey: "https://rss.nytimes.com/services/xml/rss/nyt/Hockey.xml",
  ProBasketball: "https://rss.nytimes.com/services/xml/rss/nyt/ProBasketball.xml",
  ProFootball: "https://rss.nytimes.com/services/xml/rss/nyt/ProFootball.xml",
  Soccer: "https://rss.nytimes.com/services/xml/rss/nyt/Soccer.xml",
  Tennis: "https://rss.nytimes.com/services/xml/rss/nyt/Tennis.xml",
  Science: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml",
  Environment: "https://rss.nytimes.com/services/xml/rss/nyt/Environment.xml",
  Health: "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
  Arts: "https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml",
  Movies: "https://rss.nytimes.com/services/xml/rss/nyt/Movies.xml",
  Music: "https://rss.nytimes.com/services/xml/rss/nyt/Music.xml",
  Theater: "https://rss.nytimes.com/services/xml/rss/nyt/Theater.xml",
  FashionStyle: "https://rss.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml",
  Travel: "https://rss.nytimes.com/services/xml/rss/nyt/Travel.xml",
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

const IMG_REGEX = /<img[^>]+src=["']([^"']+)["']/i;
const VIDEO_REGEX = /https?:\/\/[^\s"']+\.(mp4|m3u8)/i;

function extractMedia(item) {
  let imageUrl = null, videoUrl = null, audioUrl = null;

  if (Array.isArray(item.mediaContent)) {
    for (const m of item.mediaContent) {
      const url = m.url || (m.$ && m.$.url);
      const medium = m.medium || (m.$ && m.$.medium) || "";

      if (!url) continue;
      if (!imageUrl && /image/i.test(medium)) imageUrl = url;
      if (!videoUrl && /video/i.test(medium)) videoUrl = url;
      if (!audioUrl && /audio/i.test(medium)) audioUrl = url;
    }
  }

  if (item.enclosure?.url) {
    const type = item.enclosure.type || "";
    if (!imageUrl && /image/i.test(type)) imageUrl = item.enclosure.url;
    if (!videoUrl && /video/i.test(type)) videoUrl = item.enclosure.url;
    if (!audioUrl && /audio/i.test(type)) audioUrl = item.enclosure.url;
  }

  if (!imageUrl && Array.isArray(item.mediaThumbnail) && item.mediaThumbnail[0]) {
    const thumb = item.mediaThumbnail[0];
    imageUrl = thumb.url || (thumb.$ && thumb.$.url) || imageUrl;
  }

  const contentBlock = item.fullContent || item.content || item.description || "";
  const imgMatch = contentBlock.match(IMG_REGEX);
  if (!imageUrl && imgMatch) imageUrl = imgMatch[1];

  if (!videoUrl) {
    const vmatch = (item.fullContent || item.contentSnippet || "").match(VIDEO_REGEX);
    if (vmatch) videoUrl = vmatch[0];
  }

  return { imageUrl, videoUrl, audioUrl };
}

async function ensureNYTChannel() {
  let channel = await Channel.findOne({ name: "The New York Times" });

  if (!channel) {
    channel = new Channel({
      name: "The New York Times",
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

function safeText(input) {
  if (!input) return "";
  if (Array.isArray(input)) return input.join(" ");
  if (typeof input === "object") return JSON.stringify(input);
  return String(input);
}

async function fetchNYTFeed(feedName, url) {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((item) => {
      const { imageUrl, videoUrl, audioUrl } = extractMedia(item);

      const rawTitle = safeText(item.title);
      const rawSummary = safeText(item.contentSnippet);
      const rawContent = safeText(item.fullContent || item.contentSnippet);

      // ✅ Fallback: if no image, use NYT logo
      const finalImage = imageUrl || "https://static01.nyt.com/images/misc/NYT_logo_rss_64.png";

      return {
        title: he.decode(rawTitle).trim(),
        summary: he.decode(rawSummary).trim(),
        content: he.decode(rawContent).trim(),
        url: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        image: finalImage,
        mediaUrl: audioUrl || videoUrl || null,
        isVideo: Boolean(videoUrl),
        tags: item.categories?.map((c) => he.decode(safeText(c)).trim()) || [feedName],
        channel: "The New York Times",
        category: feedName,
      };
    });
  } catch (err) {
    console.error(`❌ Error fetching ${feedName} (${url}):`, err.message);
    return [];
  }
}


export async function fetchAndSaveNYTFeeds() {
  console.log("\n📡 Fetching NYT feeds...");

  const channel = await ensureNYTChannel();

  await Promise.all(
    Object.entries(feeds).map(async ([feedName, url]) => {
      const items = await fetchNYTFeed(feedName, url);

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

  console.log("\n✅ NYT feeds processed");
}
