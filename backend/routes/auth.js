import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, preferences } = req.body;

    //  Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email is already taken' });
    }

    //  Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Save user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      preferences: preferences || {
        topics: [],
        regions: [],
        languages: ['en'],
        mediaTypes: ['text', 'image', 'video']
      }
    });

    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });

  } catch (err) {
    // Catch Mongo duplicate error as a fallback
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} is already taken`
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;