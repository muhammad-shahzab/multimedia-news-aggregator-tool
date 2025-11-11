export function shuffleAndDeduplicateArticles(articles) {
  // Remove duplicates based on url and category combination
  const seenUrlCategory = new Set();
  const uniqueArticles = articles.filter(article => {
    const key = `${article.url}|${article.category}`;
    if (seenUrlCategory.has(key)) {
      return false;
    }
    seenUrlCategory.add(key);
    return true;
  });

  // Fisher-Yates shuffle
  for (let i = uniqueArticles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniqueArticles[i], uniqueArticles[j]] = [uniqueArticles[j], uniqueArticles[i]];
  }

  return uniqueArticles;
}