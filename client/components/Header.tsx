'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ProfileDropdown } from './ProfileDropdown';
import { CreateBoardModal } from './CreateBoardModal';
import { NotificationPopup } from './NotificationPopup';
import styles from './Header.module.css';

interface Props {
  onSearch?: (query: string) => void;
}

export const Header = ({ onSearch }: Props) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className={styles.mainHeader}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logo}>
            <img
              src="/flowlog-logo.png"
              alt="FlowLog"
              className={styles.logoIcon}
              style={{ height: '28px', width: 'auto' }}
            />
          </Link>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.headerSearch}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className={styles.headerSearchInput}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            Create
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className={styles.headerIconBtn}
              title="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </button>
            {showNotifications && (
              <NotificationPopup onClose={() => setShowNotifications(false)} />
            )}
          </div>

          <button className={styles.headerIconBtn} title="Information">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </button>

          <div style={{ position: 'relative' }}>
            <div
              className={styles.avatar}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              HR
            </div>
            {showProfileMenu && (
              <ProfileDropdown onClose={() => setShowProfileMenu(false)} />
            )}
          </div>
        </div>
      </header>
      {showCreateModal && <CreateBoardModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
};
