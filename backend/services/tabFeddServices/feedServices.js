// export const fetchFollowingArticles = async (favTopics = [], favChannels = []) => {
//   const allArticles = await getArticlesFromRSS();

//   // Filter by both topics and channels
//   return filterArticlesByTopicsAndChannels(allArticles, favTopics, favChannels);
// };

//  filterArticlesByTopicsAndChannels(articles, topics, channels)
//   {
//   if (!Array.isArray(articles)) return [];

//   return articles.filter(article => {
//     const title = article.title?.toLowerCase() || "";
//     const category = article.category?.toLowerCase() || "";
//     const channel = article.source?.toLowerCase() || "";

//     const topicMatch = topics.some(t => title.includes(t) || category.includes(t));
//     const channelMatch = channels.some(c => channel.includes(c));

//     // Return true if article matches at least one topic or one channel
//     return topicMatch || channelMatch;
//   });
// };
