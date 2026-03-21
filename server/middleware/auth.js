// Simple auth middleware — extracts user ID from the "flowlog-temp-token-{id}" pattern
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Guest token — allow readonly-ish access but no user association
  if (token === 'guest-token') {
    req.userId = null;
    req.isGuest = true;
    req.isPremium = false;
    return next();
  }

  // Extract user ID from token format: "flowlog-temp-token-{id}"
  const match = token.match(/^flowlog-temp-token-(\d+)$/);
  if (match) {
    req.userId = parseInt(match[1]);
    req.isGuest = false;

    // Look up user to attach isPremium
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { isPremium: true }
      });
      req.isPremium = user?.isPremium || false;
    } catch {
      req.isPremium = false;
    }

    return next();
  }

  // Also support "logged-in" as a fallback (older format)
  if (token === 'logged-in') {
    req.userId = null;
    req.isGuest = true;
    req.isPremium = false;
    return next();
  }

  return res.status(401).json({ error: 'Invalid token' });
};

module.exports = authMiddleware;
