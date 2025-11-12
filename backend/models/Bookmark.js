import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Bookmark", BookmarkSchema);
