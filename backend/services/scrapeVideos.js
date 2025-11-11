import Parser from 'rss-parser';
const parser = new Parser();

// Category → List of channel IDs
const categoryMap = {
  "technology": [
    "UCVHFbqXqoYvEWM1Ddxl0QDg", // Traversy Media
    "UCsTcErHg8oDvUnTzoqsYeNw", // TechCrunch
    "UC_x5XG1OV2P6uZZ5FSM9Ttw"  // Google Developers
  ],
  "business": [
    "UCUMZ7gohGI9HcU9VNsr2FJQ", // Bloomberg Quicktake
    "UCBi2mrWuNuyYy4gbM6fU18Q", // ABC News
    "UCqnbDFdCpuN8CMEg0VuEBqA"  // NYT
  ],
  "sports": [
    "UCYzPXprvl5Y-Sf0g4vX-m6g", // Sky Sports
    "UCqZQlzSHbVJrwrn5XvzrzcA", // ESPN
  ],
  "entertainment": [
    "UCi8e0iOVk1fEOogdfu4YgfA", // Entertainment Tonight
    "UCl8dMTqDrJQ0c8y23UBu4kQ"  // E! News
  ],
  "health": [
    "UCiMG07KHvLuBzRr0W8L0z4Q", // Mayo Clinic
    "UC1hI1ZOsVWXs9_JZAfX9g1g"  // HealthLine
  ],
  "science": [
    "UCZYTClx2T1of7BRZ86-8fow", // SciShow
    "UCsXVk37bltHxD1rDPwtNM8Q"  // Kurzgesagt
  ],
  "world": [
    "UC16niRr50-MSBwiO3YDb3RA", // BBC News
    "UCNye-wNBqNL5ZzHSJj3l8Bg", // Al Jazeera
    "UCupvZG-5ko_eiXAupbDfxWw"  // CNN
  ],
  "for-you": [
    "UC16niRr50-MSBwiO3YDb3RA", // BBC
    "UCsTcErHg8oDvUnTzoqsYeNw", // TechCrunch
    "UCqnbDFdCpuN8CMEg0VuEBqA", // NYT
    "UCZYTClx2T1of7BRZ86-8fow", // SciShow
  ]
};

export const scrapeYouTubeVideos = async (category = 'for-you') => {
  const channelIds = categoryMap[category] || categoryMap["for-you"];
  const rssFeeds = channelIds.map(id => `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);

  let allVideos = [];

  for (const url of rssFeeds) {
    try {
      const feed = await parser.parseURL(url);
      const videos = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
        published: item.pubDate,
        author: feed.title,
        description: item.contentSnippet,
        thumbnail: item.media?.thumbnail?.url || null,
      }));
      allVideos = allVideos.concat(videos);
    } catch (error) {
      console.error(`❌ Failed to parse ${url}:`, error.message);
    }
  }

  return allVideos;
};
