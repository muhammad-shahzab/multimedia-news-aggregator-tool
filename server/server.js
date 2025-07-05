import express, { json } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import rssRoutes from "./routes/rss.js";


dotenv.config();

const app= express();
app.use(express.json());
app.use(cors());



app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api", rssRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));

