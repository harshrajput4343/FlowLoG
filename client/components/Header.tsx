'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProfileDropdown } from './ProfileDropdown';
import { CreateBoardModal } from './CreateBoardModal';
import { NotificationPopup } from './NotificationPopup';
import { apiClient } from '@/utils/api';
import styles from './Header.module.css';

interface Board {
  id: number;
  title: string;
  background?: string;
}

interface Props {
  onSearch?: (query: string) => void;
  onToggleSidebar?: () => void;
}

export const Header = ({ onSearch, onToggleSidebar }: Props) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Board[]>([]);
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [userInitials, setUserInitials] = useState('U');

  // Load user initial (first letter of name) from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        const name = user.name || user.email || 'U';
        const firstChar = name.trim()[0];
        if (firstChar) {
          setUserInitials(firstChar.toUpperCase());
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Fetch all boards on mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const boards = await apiClient.getBoards();
        setAllBoards(boards);
      } catch (err) {
        console.error('Failed to fetch boards:', err);
      }
    };
    fetchBoards();
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Filter boards when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allBoards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery, allBoards]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleBoardClick = (boardId: number) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(`/board/${boardId}`);
  };

  return (
    <>
      <header className={styles.mainHeader}>
        <div className={styles.headerLeft}>
          {/* Hamburger menu — visible only on mobile via CSS */}
          <button
            className={styles.hamburgerBtn}
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>

          <Link href="/" className={styles.logo}>
            <svg className={styles.logoIcon} width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="headerGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <rect x="6" y="4" width="6" height="24" rx="3" fill="url(#headerGrad)" />
              <rect x="15" y="4" width="12" height="6" rx="3" fill="url(#headerGrad)" />
              <rect x="15" y="13" width="8" height="6" rx="3" fill="url(#headerGrad)" />
            </svg>
            <span className={styles.logoText}>FlowLog</span>
          </Link>
        </div>

        <div className={styles.headerCenter} ref={searchRef}>
          <div className={styles.headerSearch}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search boards..."
              className={styles.headerSearchInput}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className={styles.searchDropdown}>
                {searchResults.length > 0 ? (
                  <>
                    <div className={styles.searchDropdownHeader}>Boards</div>
                    {searchResults.map(board => (
                      <div
                        key={board.id}
                        className={styles.searchResultItem}
                        onClick={() => handleBoardClick(board.id)}
                      >
                        <div
                          className={styles.searchResultIcon}
                          style={{
                            background: board.background?.startsWith('#')
                              ? board.background
                              : 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)'
                          }}
                        />
                        <span>{board.title}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className={styles.noResults}>
                    No boards found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Mobile search toggle — visible only on mobile via CSS */}
          <button
            className={styles.mobileSearchBtn}
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          <button
            className={styles.createBtn}
            onClick={() => {
              const token = typeof window !== 'undefined' && localStorage.getItem('authToken');
              if (!token) {
                router.push('/login');
              } else {
                setShowCreateModal(true);
              }
            }}
          >
            Create
          </button>

          <div ref={notificationsRef} style={{ position: 'relative' }}>
            <button
              className={styles.headerIconBtn}
              title="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            {showNotifications && (
              <NotificationPopup onClose={() => setShowNotifications(false)} />
            )}
          </div>

          <button className={styles.headerIconBtn} title="Information">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </button>

          <div ref={profileRef} style={{ position: 'relative' }}>
            <div
              className={styles.avatar}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {userInitials}
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
