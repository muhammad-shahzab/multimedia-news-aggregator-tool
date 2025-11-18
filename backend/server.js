import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import {fetchAllFeeds} from "./services/chennal_rss/index.js";
import getVideosArticles from "./services/fetchVedio/youtubeArticles.js";

import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import rssRoutes from "./routes/rss.js"
import bookmarkRoutes from "./routes/bookmarks.js"
import historyRoutes from "./routes/history.js"
import channelRoutes from "./routes/channelsRoutes.js";
import alertsRoutes from "./routes/alertsRoutes.js";
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())



app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/rssfeed", rssRoutes)
app.use("/api/bookmarks", bookmarkRoutes)
app.use("/api/history", historyRoutes)


// Shahzaib Added Channels Endpoint
app.use("/api/channels", channelRoutes);
app.use("/api/alerts", alertsRoutes);


const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected")
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
    //test
  // fetchAllFeeds();

  })
  .catch((err) => console.error("MongoDB connection error:", err))


//test
//   const articles = await getVideosArticles();
//  console.log("Total videos fetched:", articles.length);


