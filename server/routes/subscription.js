const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getSubscriptionStatus,
  upgradeSubscription,
  cancelSubscription
} = require('../controllers/subscriptionController');

// All routes require authentication
router.use(authMiddleware);

router.get('/status', getSubscriptionStatus);
router.post('/upgrade', upgradeSubscription);
router.post('/cancel', cancelSubscription);

module.exports = router;
