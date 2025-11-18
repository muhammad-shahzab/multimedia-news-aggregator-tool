
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import Admin from "../models/admin.js"  // adjust path if needed

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourDB"

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("MongoDB connected")

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" })
    if (existingAdmin) {
      console.log("Admin already exists")
      process.exit(0)
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10)

    // Create dummy admin
    const admin = new Admin({
      email: "admin@example.com",
      password: hashedPassword,
    })

    await admin.save()
    console.log("Dummy admin created successfully!")
    process.exit(0)
  } catch (err) {
    console.error("Error creating admin:", err)
    process.exit(1)
  }
}

createAdmin()
