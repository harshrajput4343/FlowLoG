const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// In-memory store for invitations (in production, use database)
let invitations = [];

// Send invitation
router.post('/', async (req, res) => {
  try {
    const { email, workspaceId } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already invited
    const existing = invitations.find(inv => inv.email === email && inv.workspaceId === workspaceId);
    if (existing) {
      return res.status(400).json({ error: 'This email has already been invited' });
    }

    // Create invitation
    const invitation = {
      id: Date.now(),
      email,
      workspaceId: workspaceId || 1,
      status: 'sent',
      sentAt: new Date().toISOString(),
      token: generateToken()
    };

    invitations.push(invitation);

    // In a real app, send email here using nodemailer or similar
    console.log(`Invitation email would be sent to: ${email}`);
    console.log(`Invitation link: http://localhost:3000/invite/${invitation.token}`);

    res.status(201).json({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      sentAt: invitation.sentAt
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Get all invitations for a workspace
router.get('/', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const filtered = invitations.filter(inv =>
      workspaceId ? inv.workspaceId === parseInt(workspaceId) : true
    );
    res.json(filtered);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Resend invitation
router.post('/:id/resend', async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = invitations.find(inv => inv.id === parseInt(id));

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    invitation.sentAt = new Date().toISOString();

    console.log(`Resent invitation to: ${invitation.email}`);
    res.json(invitation);
  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
});

// Cancel/delete invitation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = invitations.findIndex(inv => inv.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    invitations.splice(index, 1);
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
    const { userId } = req.body;

    const invitation = invitations.find(inv => inv.token === token);

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // In real app: add user to workspace members
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date().toISOString();

    res.json({ message: 'Invitation accepted', workspaceId: invitation.workspaceId });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Helper function to generate token
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

module.exports = router;
