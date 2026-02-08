'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const isTemplates = pathname === '/templates';
  const isMembers = pathname === '/members';
  const isSettings = pathname === '/settings';

  return (
    <nav className={styles.sidebar}>
      {/* Main Navigation */}
      <div className={styles.navSection}>
        <Link href="/" className={`${styles.navItem} ${pathname === '/' || pathname === '/boards' ? styles.active : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Boards</span>
        </Link>

        <Link href="/templates" className={`${styles.navItem} ${isTemplates ? styles.active : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <span>Templates</span>
        </Link>
      </div>

      {/* Workspaces Section */}
      <div className={styles.sectionDivider}>
        <span className={styles.sectionLabel}>Workspaces</span>
      </div>

      {/* Workspace Item */}
      <div className={styles.workspaceItem} onClick={() => setExpanded(!expanded)}>
        <div className={styles.workspaceLogo}>F</div>
        <span className={styles.workspaceName}>FlowLog Workspace</span>
        <svg
          className={`${styles.chevron} ${expanded ? styles.expanded : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </div>

      {expanded && (
        <div className={styles.workspaceSubItems}>
          <Link href="/" className={`${styles.workspaceSubItem} ${pathname === '/' ? styles.activeSub : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span>Boards</span>
          </Link>

          <Link href="/members" className={`${styles.workspaceSubItem} ${isMembers ? styles.activeSub : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
            <span>Members</span>
            <button className={styles.addBtn}>+</button>
          </Link>

          <Link href="/settings" className={`${styles.workspaceSubItem} ${isSettings ? styles.activeSub : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span>Settings</span>
          </Link>
        </div>
      )}

      {/* Upgrade Banner */}
      <div className={styles.upgradeBanner}>
        <div className={styles.upgradeTitle}>Upgrade this Workspace</div>
        <div className={styles.upgradeDesc}>
          Get unlimited boards, advanced automation, and more.
        </div>
        <div className={styles.upgradeIcon}>💎</div>
      </div>
    </nav>
  );
};
