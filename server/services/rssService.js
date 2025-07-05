import Parser from "rss-parser";
const parser = new Parser();

const defaultFeeds = [
  { topic: "technology", url: "https://feeds.bbci.co.uk/news/technology/rss.xml" },
  { topic: "sports", url: "http://feeds.bbci.co.uk/sport/rss.xml?edition=uk" },
  { topic: "business", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  { topic: "world", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" }
];

export async function fetchPersonalizedRSS(preferences) {
  let selectedFeeds = [];

  if (preferences.topics && preferences.topics.length > 0) {
    selectedFeeds = defaultFeeds.filter(feed =>
      preferences.topics.includes(feed.topic)
    );
  }

  if (selectedFeeds.length === 0) {
    selectedFeeds = defaultFeeds; // fallback
  }

  const allArticles = [];

  for (const feed of selectedFeeds) {
    const parsed = await parser.parseURL(feed.url);
    const articles = parsed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet,
      image: item.enclosure?.url || null,
      feedTopic: feed.topic
    }));
    allArticles.push(...articles);
  }

  // Sort newest first
  allArticles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return allArticles.slice(0, 20);
}
