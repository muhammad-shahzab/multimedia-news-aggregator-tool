import { Article } from "../models/Article.js";

export async function fetchPersonalizedArticles(preferences) {
  try {
    const { topics = [], favChannel = [], favtags = [] } = preferences;

    // If user has no preferences → fallback to general feed
    const hasPreferences = topics.length || favChannel.length || favtags.length;

    const pipeline = [
      {
        $facet: {
          byTopics: topics.length
            ? [
                { $match: { category: { $in: topics } } },
                { $sample: { size: topics.length * 5 } }, // 5 each topic
              ]
            : [],

          byChannels: favChannel.length
            ? [
                { $match: { channel: { $in: favChannel } } },
                { $sample: { size: favChannel.length * 5 } }, // 5 each channel
              ]
            : [],

          byTags: favtags.length
            ? [
                { $match: { tags: { $in: favtags } } },
                { $sample: { size: favtags.length * 5 } }, // 5 each tag
              ]
            : [],

          // fallback general feed (articles or videos)
          fallback: hasPreferences
            ? [
                { $match: {} },
                { $sample: { size: 50 } }
              ]
            : [
                // first time user → give mixed feed
                { $match: {} },
                { $sample: { size: 80 } }
              ],
        },
      },

      // merge all arrays into one
      {
        $project: {
          all: {
            $setUnion: ["$byTopics", "$byChannels", "$byTags", "$fallback"],
          },
        },
      },

      // Flatten the merged array
      { $unwind: "$all" },

      // Re-shuffle
      { $sample: { size: 60 } }, // pick final 60 max

      // Final output
      { $replaceRoot: { newRoot: "$all" } },
    ];

    const result = await Article.aggregate(pipeline);
    return result;
  } catch (err) {
    console.error("Error fetching personalized:", err);
    return [];
  }
}
