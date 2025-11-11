// index.js
import { fetchAndSaveBBCFeeds } from "./bbc-rss-parser.js";
import { fetchAndSaveCNNFeeds } from "./cnn-rss-parser.js";
import { fetchAndSaveNYTFeeds } from "./nyt-rss-parser.js";
import { fetchAndSaveAlJazeeraFeeds } from "./aljazeera-rss-parser.js";
import { fetchAndSaveGuardianFeeds } from "./guardian-rss-parser.js";
import { fetchAndSaveDawnFeeds } from "./dawn-rss-parser.js";
import { fetchAndSaveESPNFeeds } from "./espn-rss-parser.js";
import { fetchAndSaveGeoFeeds } from "./geo-rss-parser.js";
import { fetchAndSaveTribuneFeeds } from "./tribune-rss-parser.js";
import { fetchAndSaveJangFeeds } from "./jang-rss-parser.js";

export async function fetchAllFeeds() {
  await fetchAndSaveBBCFeeds();
  await fetchAndSaveCNNFeeds();
  await fetchAndSaveNYTFeeds();
  await fetchAndSaveAlJazeeraFeeds();
  await fetchAndSaveGuardianFeeds();
  await fetchAndSaveDawnFeeds();
  await fetchAndSaveESPNFeeds();
  await fetchAndSaveGeoFeeds();
  await fetchAndSaveTribuneFeeds();
  await fetchAndSaveJangFeeds();
  console.log(" All feeds fetched and saved!");
}

// // run directly
// fetchAllFeeds();
