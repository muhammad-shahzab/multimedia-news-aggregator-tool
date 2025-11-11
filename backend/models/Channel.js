import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
});

const ChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    categories: [CategorySchema], // Array of category objects
  },
  { timestamps: true }
);

export const Channel = mongoose.model("Channel", ChannelSchema);
