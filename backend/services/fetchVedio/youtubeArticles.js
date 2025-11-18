


// services/getLatestVideos.js
import axios from "axios";
import dotenv from "dotenv";
import  {Article}  from "../../models/Article.js";

dotenv.config();

export const NEWS_SOURCES = {
  BBC: { name: "BBC News", channel: ["UC16niRr50-MSBwiO3YDb3RA", "UCqnbDFdCpuN8CMEg0VuEBqA"] },
  CNN: { name: "CNN", channel: ["UCupvZG-5ko_eiXAupbDfxWw", "UCXIJgqnII2ZOINSWNOGFThA"] },
  NYT: { name: "The New York Times", channel: ["UCqnbDFdCpuN8CMEg0VuEBqA"] },
  AL_JAZEERA: { name: "Al Jazeera English", channel: ["UCNye-wNBqNL5ZzHSJj3l8Bg"] },
  GUARDIAN: { name: "The Guardian", channel: ["UCHpw8xwDNhU9gdohEcJu4aA", "UCIRYBXDze5krPDzAEOxFGVA"] },
  DAWN: { name: "Dawn", channel: ["UCaxR-D8FjZ-2otbU0_Y2grg"] },
  ESPN: { name: "ESPN", channel: ["UCiWLfSweyRNmLpgEHekhoAg"] },
  GEO: { name: "Geo News", channel: ["UC_vt34wimdCzdkrzVejwX9g", "UCF73oBsmZPG6YRZV-vVN1-A"] },
  TRIBUNE: { name: "Tribune", channel: ["UCA8R4NNFAf9I6aipqdgoUwg"] },
  JANG: { name: "Jang", channel: ["UCA0lYvurqSUe3LNjjRRi03w"] },
};

const YT_API = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YT_API_KEY;

if (!API_KEY) {
  throw new Error("Please set process.env.YT_API_KEY");
}

export async function getVideosArticles() {
  const axiosInstance = axios.create({
    baseURL: YT_API,
    params: { key: API_KEY },
  });

  let articlesToInsert = [];

  // Fetch playlist ID
  async function getUploadsPlaylistId(channelId) {
    const res = await axiosInstance.get("/channels", {
      params: { part: "contentDetails", id: channelId },
    });
    return res.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
  }

  async function getVideoIds(playlistId) {
    const res = await axiosInstance.get("/playlistItems", {
      params: { part: "contentDetails", playlistId, maxResults: 50 },
    });
    return res.data.items.map(i => i.contentDetails.videoId);
  }

  async function getVideoDetails(videoIds) {
    if (videoIds.length === 0) return [];
    const res = await axiosInstance.get("/videos", {
      params: { part: "snippet,contentDetails", id: videoIds.join(",") },
    });
    return res.data.items || [];
  }

  // Loop channels
  for (const [sourceKey, source] of Object.entries(NEWS_SOURCES)) {
    for (const channelId of source.channel) {
      console.log(`🔹 Fetching channel: ${source.name} | ${channelId}`);

      try {
        const uploadsPlaylist = await getUploadsPlaylistId(channelId);
        if (!uploadsPlaylist) {
          console.warn(` No uploads playlist for channel: ${source.name}`);
          continue;
        }

        const videoIds = await getVideoIds(uploadsPlaylist);
        const videos = await getVideoDetails(videoIds);

        const YTarticles = videos.map(vid => {
          const s = vid.snippet || {};
          const url = `https://www.youtube.com/watch?v=${vid.id}`;

          return {
            title: s.title || "",
            summary: s.description || "",
            content: s.description || "",
            url,
            mediaUrl: url,
            publishedAt: s.publishedAt ? new Date(s.publishedAt) : new Date(),
            image: s.thumbnails?.high?.url || s.thumbnails?.medium?.url || s.thumbnails?.default?.url || "",
            isVideo: true,
            tags: s.tags || [],
            channel: source.name,
            category: sourceKey,
          };
        });

        articlesToInsert.push(...YTarticles);
        console.log(` Fetched ${YTarticles.length} videos from channel: ${source.name}`);

      } catch (err) {
        console.error(` Error fetching ${source.name}:`, err?.response?.data || err.message);
      }
    }
  }

  console.log(` Total videos collected: ${articlesToInsert.length}`);

  //  BULK INSERT INTO MONGODB
  try {
    const result = await Article.insertMany(articlesToInsert, {
      ordered: false, // Continue even if duplicates exist
    });

    console.log(` Successfully inserted ${result.length} new articles.`);
  } catch (err) {
    if (err.writeErrors) {
      console.warn(` Skipped ${err.writeErrors.length} duplicates.`);
    } else {
      console.error(" Insert error:", err);
    }
  }

  return articlesToInsert;
}

export default getVideosArticles;
