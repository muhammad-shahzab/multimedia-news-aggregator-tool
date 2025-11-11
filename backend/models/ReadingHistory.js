import mongoose from "mongoose"

const ReadingHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    articleId: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, required: true },
    category: { type: String, required: true },
    readProgress: { type: Number, default: 0, min: 0, max: 100 },
    readTime: { type: Number, default: 0 }, // in seconds
    completedAt: { type: Date },
  },
  { timestamps: true },
)

export default mongoose.model("ReadingHistory", ReadingHistorySchema)