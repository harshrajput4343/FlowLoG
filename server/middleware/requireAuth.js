/**
 * requireAuth — rejects guests and unauthenticated callers on write routes.
 *
 * Use as a second middleware after authMiddleware on any route that must
 * not be accessible without a real user account.
 *
 * Fix: BUG 3 — guest accounts had full write access to all mutation endpoints.
 */

const requireAuth = (req, res, next) => {
  if (!req.userId || req.isGuest) {
    return res.status(403).json({ error: 'You must be logged in to perform this action' });
  }
  return next();
};

module.exports = requireAuth;
