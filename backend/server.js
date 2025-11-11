import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"

import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import rssRoutes from "./routes/rss.js"
import bookmarkRoutes from "./routes/bookmarks.js"
import historyRoutes from "./routes/history.js"
import youtubeRoutes from './routes/youtube.js';
// Shahzaib Added Channels Endpoint
import channelRoutes from "./routes/channelsRoutes.js";
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())



app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api", rssRoutes)
app.use("/api/bookmarks", bookmarkRoutes)
app.use("/api/history", historyRoutes)
app.use('/api/youtube', youtubeRoutes);

// Shahzaib Added Channels Endpoint
app.use("/api/channels", channelRoutes);



const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected")
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
  })
  .catch((err) => console.error("MongoDB connection error:", err))
