// Simple auth middleware — extracts user ID from the "flowlog-temp-token-{id}" pattern
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Guest token — allow readonly-ish access but no user association
  if (token === 'guest-token') {
    req.userId = null;
    req.isGuest = true;
    return next();
  }

  // Extract user ID from token format: "flowlog-temp-token-{id}"
  const match = token.match(/^flowlog-temp-token-(\d+)$/);
  if (match) {
    req.userId = parseInt(match[1]);
    req.isGuest = false;
    return next();
  }

  // Also support "logged-in" as a fallback (older format)
  if (token === 'logged-in') {
    req.userId = null;
    req.isGuest = true;
    return next();
  }

  return res.status(401).json({ error: 'Invalid token' });
};

module.exports = authMiddleware;
