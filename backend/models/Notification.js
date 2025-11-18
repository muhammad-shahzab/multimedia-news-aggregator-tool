// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  thumbnail: String,
  url: String,     
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
