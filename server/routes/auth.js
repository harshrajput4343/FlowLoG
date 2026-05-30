/**
 * Auth Routes — signup / login / /me
 *
 * Fixes:
 *   BUG 1  — tokens are now signed JWTs (HS256, 7-day expiry) not predictable strings
 *   BUG 1+ — login now verifies the password hash (bcrypt) before issuing a token;
 *             previously there was NO password check at all
 */

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const prisma   = require('../prismaClient');
const authMiddleware = require('../middleware/auth');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d';
const BCRYPT_ROUNDS = 12;

/** Issue a signed JWT for a given user ID */
function issueToken(userId) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const newUser = await prisma.user.create({
      data: { name, email, passwordHash }
    });

    const token = issueToken(newUser.id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id:       newUser.id,
        name:     newUser.name,
        email:    newUser.email,
        avatarUrl: newUser.avatarUrl,
        isPremium: newUser.isPremium
      }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Deliberately vague — don't reveal whether email exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Users created before the password system have no hash — force reset
    if (!user.passwordHash) {
      return res.status(401).json({
        error: 'This account was created before passwords were enabled. Please reset your password or contact support.'
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = issueToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id:       user.id,
        name:     user.name,
        email:    user.email,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, avatarUrl: true, isPremium: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
