const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Login route — find user by email, return token with user ID
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please sign up first.' });
    }

    // Simple token-based auth (no password verification in this version)
    res.json({
      message: 'Login successful',
      token: 'flowlog-temp-token-' + user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Signup route — create a new user, return token
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user (no password field in DB — simple auth)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        // avatarUrl can be set later
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      token: 'flowlog-temp-token-' + newUser.id,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl
      }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// Get current user (for token validation)
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const match = token.match(/^flowlog-temp-token-(\d+)$/);
  if (!match) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(match[1]) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
