
import getVideosArticles from "./services/getLatestVideos.js";

(async () => {
  const articles = await getVideosArticles();
  console.log("Total videos fetched:", articles.length);
  console.log(articles.slice(0, 5)); // show first 5
})();
