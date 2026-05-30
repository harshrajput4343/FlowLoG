/**
 * Auth Middleware — verifies a signed JWT and attaches userId/isPremium to req.
 *
 * Fixes:
 *   BUG 1  — replaced deterministic "flowlog-temp-token-{id}" with signed JWT
 *   BUG 3  — removed guest-token and "logged-in" backdoors; unauthenticated
 *             requests now receive 401 unless the route opts out of this middleware
 */

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set in environment variables');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Verify the user still exists (handles deleted accounts)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isPremium: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found — please log in again' });
    }

    req.userId    = user.id;
    req.isPremium = user.isPremium;
    req.isGuest   = false;

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired — please log in again' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = authMiddleware;
