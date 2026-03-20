'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { apiClient } from '@/utils/api';
import { isPremiumUser } from '@/utils/premiumGate';
import { PremiumGateModal } from '@/components/PremiumGateModal';
import { useToast } from '@/contexts/ToastContext';
import styles from './page.module.css';

interface Member {
  id: number;
  name: string;
  email: string;
}

interface Invitation {
  id: number;
  email: string;
  status: string;
  sentAt: string;
}

export default function MembersPage() {
  const { addToast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'guests' | 'requests'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [joinRequestsEnabled, setJoinRequestsEnabled] = useState(false);

  // Get current user from localStorage
  const getCurrentUser = (): { id: number; name: string; email: string } | null => {
    if (typeof window === 'undefined') return null;
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch { return null; }
  };

  const currentUser = getCurrentUser();

  // Fetch members & invitations on mount
  useEffect(() => {
    apiClient.getUsers().then(users => {
      if (Array.isArray(users)) setMembers(users);
    }).catch(console.error);

    apiClient.getInvitations().then(invs => {
      if (Array.isArray(invs)) setInvitations(invs);
    }).catch(() => {});
  }, []);

  // Filter members by search
  const filteredMembers = members.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q);
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Premium check
    if (!isPremiumUser()) {
      setShowPremiumGate(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast('Please enter a valid email address', 'error');
      return;
    }

    if (members.some(m => m.email === email)) {
      addToast('This person is already a member', 'error');
      return;
    }

    setSending(true);
    try {
      const inv = await apiClient.sendInvitation(email);
      setInvitations([...invitations, inv]);
      setEmail('');
      addToast(`Invitation sent to ${email}`, 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to send invitation', 'error');
    }
    setSending(false);
  };

  const handleResend = async (invitationId: number) => {
    try {
      await apiClient.resendInvitation(invitationId);
      const inv = invitations.find(i => i.id === invitationId);
      addToast(`Invitation resent to ${inv?.email}`, 'success');
    } catch {
      addToast('Failed to resend invitation', 'error');
    }
  };

  const handleCancelInvitation = async (invitationId: number) => {
    try {
      await apiClient.cancelInvitation(invitationId);
      setInvitations(invitations.filter(i => i.id !== invitationId));
      addToast('Invitation cancelled', 'success');
    } catch {
      addToast('Failed to cancel invitation', 'error');
    }
  };

  const handleGenerateLink = () => {
    if (!isPremiumUser()) {
      setShowPremiumGate(true);
      return;
    }
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const link = `${window.location.origin}/join/${token}`;
    setInviteLink(link);
    setShowInviteLink(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#0079bf', '#d29034', '#519839', '#b04632', '#89609e', '#cd5a91', '#4bbf6b', '#00aecc'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={styles.layoutContainer}>
      <Header />
      <div className={styles.contentContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Members ({members.length})</h1>
            <button
              className={styles.inviteBtn}
              onClick={() => {
                if (!isPremiumUser()) {
                  setShowPremiumGate(true);
                } else {
                  document.getElementById('invite-email-input')?.focus();
                }
              }}
            >
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
          {activeTab === 'members' && (
            <div className={styles.membersLayout}>
              {/* Left Panel */}
              <div className={styles.leftPanel}>
                <h2 className={styles.sectionTitle}>Workspace members ({members.length})</h2>
                <p className={styles.description}>
                  Workspace members can view and join all Workspace visible boards and create new boards in the Workspace.
                </p>

                <h3 className={styles.inviteTitle}>Invite members to join you</h3>
                <p className={styles.inviteDesc}>
                  Anyone with an invite link can join this Workspace. You can also disable and create a new invite link at any time.
                </p>

                {/* Invite Form */}
                <form onSubmit={handleInvite} className={styles.inviteForm}>
                  <input
                    id="invite-email-input"
                    type="email"
                    placeholder="Enter email address..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={styles.emailInput}
                  />
                  <button type="submit" className={styles.sendBtn} disabled={sending}>
                    {sending ? 'Sending...' : 'Send Invite'}
                  </button>
                </form>

                {/* Pending Invitations */}
                {invitations.length > 0 && (
                  <div className={styles.pendingSection}>
                    <h4 className={styles.pendingTitle}>Pending Invitations</h4>
                    {invitations.map(inv => (
                      <div key={inv.id} className={styles.pendingItem}>
                        <div className={styles.pendingInfo}>
                          <span className={styles.pendingEmail}>{inv.email}</span>
                          <span className={styles.pendingStatus}>{inv.status}</span>
                        </div>
                        <div className={styles.pendingActions}>
                          <button onClick={() => handleResend(inv.id)} className={styles.resendBtn}>Resend</button>
                          <button onClick={() => handleCancelInvitation(inv.id)} className={styles.cancelBtnSmall}>Cancel</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className={styles.searchSection}>
                  <input
                    type="text"
                    placeholder="Filter by name or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                {/* Members List */}
                <div className={styles.membersList}>
                  {filteredMembers.map(m => {
                    const isCurrentUser = currentUser?.id === m.id;
                    return (
                      <div key={m.id} className={styles.memberRow}>
                        <div className={styles.memberAvatar} style={{ background: getAvatarColor(m.name || 'U') }}>
                          {(m.name || 'U')[0].toUpperCase()}
                        </div>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberName}>
                            {m.name || 'Unknown'}
                            {isCurrentUser && <span className={styles.youBadge}>You</span>}
                          </div>
                          <div className={styles.memberEmail}>{m.email}</div>
                        </div>
                        <span className={styles.roleBadge}>{isCurrentUser ? 'Admin' : 'Member'}</span>
                        {!isCurrentUser && (
                          <button className={styles.removeBtn}>Remove</button>
                        )}
                      </div>
                    );
                  })}
                  {filteredMembers.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>👥</div>
                      <p className={styles.emptyText}>No members found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div className={styles.rightPanel}>
                <button className={styles.inviteLinkBtn} onClick={handleGenerateLink}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                  </svg>
                  Invite with link
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className={styles.tabContent}>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👤</div>
                <h3 className={styles.emptyTitle}>No guests yet</h3>
                <p className={styles.emptyText}>
                  Guests can only view and edit the boards to which they&apos;ve been added. They don&apos;t have access to other Workspace boards or settings.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className={styles.tabContent}>
              <div className={styles.toggleRow}>
                <label className={styles.toggleLabel}>
                  <div className={styles.toggleInfo}>
                    <strong>Anyone with the link can request to join</strong>
                    <span>When enabled, anyone with the workspace link can request access</span>
                  </div>
                  <div
                    className={`${styles.toggle} ${joinRequestsEnabled ? styles.toggleActive : ''}`}
                    onClick={() => setJoinRequestsEnabled(!joinRequestsEnabled)}
                  >
                    <div className={styles.toggleKnob} />
                  </div>
                </label>
              </div>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📫</div>
                <h3 className={styles.emptyTitle}>No pending join requests</h3>
                <p className={styles.emptyText}>
                  When someone requests to join your Workspace, their request will appear here for you to approve or deny.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Invite Link Modal */}
      {showInviteLink && (
        <div className={styles.modalOverlay} onClick={() => setShowInviteLink(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowInviteLink(false)}>×</button>
            <h3 className={styles.modalTitle}>Invite with link</h3>
            <p className={styles.modalDesc}>Share this link to invite people to your workspace.</p>
            <div className={styles.linkRow}>
              <input
                type="text"
                value={inviteLink}
                readOnly
                className={styles.linkInput}
              />
              <button className={styles.copyBtn} onClick={handleCopyLink}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <div className={styles.linkActions}>
              <button className={styles.disableLinkBtn} onClick={() => { setInviteLink(''); setShowInviteLink(false); }}>
                Disable Link
              </button>
              <button className={styles.newLinkBtn} onClick={() => {
                const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                setInviteLink(`${window.location.origin}/join/${token}`);
              }}>
                Generate New Link
              </button>
            </div>
          </div>
        </div>
      )}

      <PremiumGateModal
        isOpen={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        featureName="Member Invitations"
      />
    </div>
  );
}
