import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferences: {
    topics: [{ type: String }],
    regions: [{ type: String }],
    languages: [{ type: String }],
    mediaTypes: [{ type: String }],
  }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
