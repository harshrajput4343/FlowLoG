'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './page.module.css';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    // Simulate joining delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setJoined(true);
    setJoining(false);
    // Redirect after 2 seconds
    setTimeout(() => router.push('/'), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoBadge}>F</div>
          <h1 className={styles.logoText}>FlowLog</h1>
        </div>

        {joined ? (
          <div className={styles.successSection}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.title}>Welcome to FlowLog!</h2>
            <p className={styles.description}>
              You&apos;ve successfully joined the workspace. Redirecting you...
            </p>
          </div>
        ) : (
          <>
            <div className={styles.inviteIcon}>✉️</div>
            <h2 className={styles.title}>You&apos;ve been invited!</h2>
            <p className={styles.description}>
              Someone has invited you to join the <strong>FlowLog Workspace</strong>.
              Click below to accept the invitation and start collaborating.
            </p>
            <div className={styles.tokenInfo}>
              Invitation: <code>{token?.slice(0, 12)}...</code>
            </div>
            <button
              className={styles.joinBtn}
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? 'Joining...' : 'Accept & Join'}
            </button>
            <button
              className={styles.declineBtn}
              onClick={() => router.push('/')}
            >
              No thanks, go to homepage
            </button>
          </>
        )}
      </div>
    </div>
  );
}
