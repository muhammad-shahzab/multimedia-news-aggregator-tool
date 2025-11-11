import mongoose from "mongoose"

const BookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    articleId: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String },
    summary: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true },
)

export default mongoose.model("Bookmark", BookmarkSchema)