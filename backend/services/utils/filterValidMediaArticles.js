export function filterValidMediaArticles(articles) {
  // Regular expression for HTTP/HTTPS URLs
  const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

  return articles.filter(article => {
    // Check for non-empty title and summary
    const hasTitle = article.title && article.title.trim() !== '' && article.title !== 'null';
    const hasSummary = article.summary && article.summary.trim() !== '' && article.summary !== 'null';

    // Check for valid image or mediaUrl (HTTP/HTTPS URL)
    const hasMedia = 
      (article.image && article.image.trim() !== '' && article.image !== 'null' && urlRegex.test(article.image)) || 
      (article.mediaUrl && article.mediaUrl.trim() !== '' && article.mediaUrl !== 'null' && urlRegex.test(article.mediaUrl));

    return hasTitle && hasSummary && hasMedia;
  });
}