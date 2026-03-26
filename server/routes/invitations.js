const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { sendInvitationEmail, isEmailConfigured } = require('../utils/emailService');
const authMiddleware = require('../middleware/auth');

// Helper function to generate token
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Send invitation (auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { email, workspaceId } = req.body;
    const senderId = req.userId;

    if (!senderId) {
      return res.status(401).json({ error: 'Authentication required to send invitations' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already invited by this user
    const existing = await prisma.invitation.findFirst({
      where: { email, senderId, status: 'pending' }
    });
    if (existing) {
      return res.status(400).json({ error: 'This email has already been invited' });
    }

    const token = generateToken();

    // Save invitation to database
    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        workspaceId: workspaceId || 1,
        senderId,
        status: 'pending',
        emailSent: false,
      }
    });

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${token}`;

    // Try sending the email
    let emailSent = false;
    let emailError = null;
    if (isEmailConfigured) {
      try {
        // Look up sender name
        const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { name: true } });
        await sendInvitationEmail({
          toEmail: email,
          inviterName: sender?.name || 'FlowLoG Team',
          workspaceName: 'FlowLog Workspace',
          inviteLink
        });
        emailSent = true;
        // Update DB
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { emailSent: true }
        });
        console.log('Invitation email sent to:', email);
      } catch (err) {
        emailError = err.message;
        console.error('Email send failed:', err.message);
      }
    } else {
      emailError = 'Email service not configured. Set EMAIL_USER and EMAIL_PASS.';
      console.warn(emailError);
    }

    // Return honest result
    if (!emailSent) {
      return res.status(201).json({
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        sentAt: invitation.createdAt,
        emailSent: false,
        warning: emailError || 'Email was not sent. Invite link: ' + inviteLink,
        inviteLink
      });
    }

    res.status(201).json({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      sentAt: invitation.createdAt,
      emailSent: true,
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Get invitations for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const senderId = req.userId;
    if (!senderId) {
      return res.json([]);
    }

    const invitations = await prisma.invitation.findMany({
      where: { senderId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invitations.map(inv => ({
      id: inv.id,
      email: inv.email,
      status: inv.status,
      sentAt: inv.createdAt,
      emailSent: inv.emailSent,
    })));
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Resend invitation
router.post('/:id/resend', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.userId;

    const invitation = await prisma.invitation.findFirst({
      where: { id: parseInt(id), senderId }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${invitation.token}`;

    let emailSent = false;
    if (isEmailConfigured) {
      try {
        const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { name: true } });
        await sendInvitationEmail({
          toEmail: invitation.email,
          inviterName: sender?.name || 'FlowLoG Team',
          workspaceName: 'FlowLog Workspace',
          inviteLink
        });
        emailSent = true;
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { emailSent: true, updatedAt: new Date() }
        });
      } catch (err) {
        console.error('Resend email failed:', err.message);
      }
    }

    res.json({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      sentAt: invitation.createdAt,
      emailSent,
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
});

// Cancel/delete invitation
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const senderId = req.userId;

    const invitation = await prisma.invitation.findFirst({
      where: { id: parseInt(id), senderId }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    await prisma.invitation.delete({ where: { id: invitation.id } });
    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
});

// Accept invitation (when user clicks link)
router.post('/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' }
    });

    res.json({ message: 'Invitation accepted', workspaceId: invitation.workspaceId });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

module.exports = router;
