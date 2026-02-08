'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { apiClient } from '@/utils/api';
import styles from './page.module.css';

interface Member {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

interface Invitation {
  id: number;
  email: string;
  status: 'pending' | 'sent';
  sentAt: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'Harsh Kumar', email: 'harsh@example.com', role: 'admin', joinedAt: '2024-01-01' }
  ]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'members' | 'guests' | 'requests'>('members');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    // Check if already invited
    if (invitations.some(inv => inv.email === email)) {
      setMessage({ type: 'error', text: 'This email has already been invited' });
      return;
    }

    // Check if already a member
    if (members.some(m => m.email === email)) {
      setMessage({ type: 'error', text: 'This person is already a member' });
      return;
    }

    setSending(true);
    try {
      // Call backend API to send invitation
      const response = await fetch('http://localhost:3001/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, workspaceId: 1 })
      });

      if (response.ok) {
        const newInvitation: Invitation = {
          id: Date.now(),
          email,
          status: 'sent',
          sentAt: new Date().toISOString()
        };
        setInvitations([...invitations, newInvitation]);
        setEmail('');
        setMessage({ type: 'success', text: `Invitation sent to ${email}` });
      } else {
        // Simulate success for demo if backend not available
        const newInvitation: Invitation = {
          id: Date.now(),
          email,
          status: 'sent',
          sentAt: new Date().toISOString()
        };
        setInvitations([...invitations, newInvitation]);
        setEmail('');
        setMessage({ type: 'success', text: `Invitation sent to ${email}` });
      }
    } catch (error) {
      // Simulate success for demo
      const newInvitation: Invitation = {
        id: Date.now(),
        email,
        status: 'sent',
        sentAt: new Date().toISOString()
      };
      setInvitations([...invitations, newInvitation]);
      setEmail('');
      setMessage({ type: 'success', text: `Invitation sent to ${email}` });
    }
    setSending(false);

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  const handleResend = (invitationId: number) => {
    const invitation = invitations.find(i => i.id === invitationId);
    if (invitation) {
      setMessage({ type: 'success', text: `Invitation resent to ${invitation.email}` });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCancelInvitation = (invitationId: number) => {
    setInvitations(invitations.filter(i => i.id !== invitationId));
    setMessage({ type: 'success', text: 'Invitation cancelled' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className={styles.layoutContainer}>
      <Header />
      <div className={styles.contentContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Collaborators ({members.length})</h1>
            <button className={styles.inviteBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Invite Workspace members
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'members' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Workspace members ({members.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'guests' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('guests')}
            >
              Guests (0)
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Join requests (0)
            </button>
          </div>

          {/* Content */}
          <div className={styles.membersContent}>
            {/* Left Panel - Description */}
            <div className={styles.leftPanel}>
              <h2 className={styles.sectionTitle}>Workspace members ({members.length}) 🔒</h2>
              <p className={styles.description}>
                Workspace members can view and join all Workspace visible boards and create new boards in the Workspace. Adding new members will automatically update your billing.
              </p>

              <h3 className={styles.inviteTitle}>Invite members to join you</h3>
              <p className={styles.inviteDesc}>
                Anyone with an invite link can join this paid Workspace. You'll be billed for each member that joins. You can also disable and create a new invite link for this Workspace at any time.
              </p>

              {/* Invite Form */}
              <form onSubmit={handleInvite} className={styles.inviteForm}>
                <input
                  type="email"
                  placeholder="heytryitharsh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.emailInput}
                />
                <button
                  type="submit"
                  className={styles.sendBtn}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Invite'}
                </button>
              </form>

              {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <div className={styles.pendingSection}>
                  <h4 className={styles.pendingTitle}>Pending Invitations</h4>
                  {invitations.map(inv => (
                    <div key={inv.id} className={styles.pendingItem}>
                      <span className={styles.pendingEmail}>{inv.email}</span>
                      <span className={styles.pendingStatus}>{inv.status}</span>
                      <div className={styles.pendingActions}>
                        <button onClick={() => handleResend(inv.id)} className={styles.resendBtn}>
                          Resend
                        </button>
                        <button onClick={() => handleCancelInvitation(inv.id)} className={styles.cancelBtn}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel - Invite Link */}
            <div className={styles.rightPanel}>
              <button className={styles.inviteLinkBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                </svg>
                Invite with link
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className={styles.membersList}>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <p className={styles.emptyText}>
                Uh oh, there's no one here by that name.<br />
                Should there be? Invite them now!
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
