const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/subscription/status
const getSubscriptionStatus = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isPremium: true, subscriptionExpiry: true, subscriptionPlan: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Auto-expire if past expiry date
    if (user.isPremium && user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
      await prisma.user.update({
        where: { id: req.userId },
        data: { isPremium: false, subscriptionPlan: null }
      });
      return res.json({ isPremium: false, subscriptionExpiry: null, plan: null });
    }

    res.json({
      isPremium: user.isPremium,
      subscriptionExpiry: user.subscriptionExpiry,
      plan: user.subscriptionPlan
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
};

// POST /api/subscription/upgrade
const upgradeSubscription = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        isPremium: true,
        subscriptionExpiry: expiry,
        subscriptionPlan: 'pro'
      }
    });

    res.json({
      message: 'Successfully upgraded to Pro!',
      isPremium: true,
      subscriptionExpiry: expiry,
      plan: 'pro'
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
};

// POST /api/subscription/cancel
const cancelSubscription = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: {
        isPremium: false,
        subscriptionPlan: null,
        subscriptionExpiry: null
      }
    });

    res.json({ message: 'Subscription cancelled', isPremium: false });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

module.exports = { getSubscriptionStatus, upgradeSubscription, cancelSubscription };
