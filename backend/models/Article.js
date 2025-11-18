

import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String },
    content: { type: String },
    url: { type: String, required: true },
    mediaUrl: { type: String },
    publishedAt: { type: Date, required: true },
    image: { type: String },
    isVideo: { type: Boolean, default: false },
    tags: [{ type: String }],
    channel: { type: String, required: true },  
    category: { type: String, required: true },
  },
  { timestamps: true }
);
export const Article = mongoose.model("Article", ArticleSchema);

