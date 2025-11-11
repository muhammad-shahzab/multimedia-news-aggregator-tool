import { Article } from "../models/Article.js";
import { shuffleAndDeduplicateArticles } from "./utils/shuffleAndDeduplicate.js";
import { filterValidMediaArticles } from "./utils/filterValidMediaArticles.js";

export async function fetchPersonalizedArticles(preferences) {
  try {
    const { favtags = [], topics = [] } = preferences;

    // Check if preferences are empty
    if (!topics.length && !favtags.length) {
      console.log("No topics or tags provided, returning empty array.");
      throw new Error("No topics or tags provided in preferences.");
    }

    // Build simplified query
    const query = {
      $or: [
        ...(topics.length > 0 ? [{ category: { $in: topics } }] : []),
        ...(favtags.length > 0 ? [{ tags: { $in: favtags } }] : []),
      ],
    };

    // If no conditions, return empty array
    if (query.$or.length === 0) {
      console.log("No valid query conditions, returning empty array.");
      return [];
    }

    // ✅ Fetch matching articles randomly using $sample
    const articles = await Article.aggregate([
      { $match: query },
      { $sample: { size: 200 } }, // randomly pick 200 docs
    ]);


    // Filter articles with valid title, summary, and media
    const validArticles = filterValidMediaArticles(articles);

    // Shuffle and deduplicate articles (extra randomness + cleanup)
    const finalArticles = shuffleAndDeduplicateArticles(validArticles);
    console.log(
      `Articles after shuffling and deduplication: ${finalArticles.length}`
    );

    return finalArticles;
  } catch (error) {
    console.error("Error fetching personalized articles:", error.message);
    return [];
  }
}
