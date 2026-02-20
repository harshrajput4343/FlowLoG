const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Simple login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Since this is a simple implementation, we'll just check if user exists
    // In a real app, you'd use bcrypt to compare passwords

    res.json({
      message: 'Login successful',
      token: 'flowlog-temp-token-' + user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Simple signup route
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

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password // Note: In production you should hash this
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      token: 'flowlog-temp-token-' + newUser.id,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
