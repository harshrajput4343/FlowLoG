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
}

export const Header = ({ onSearch }: Props) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Board[]>([]);
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
          <Link href="/" className={styles.logo}>
            <img
              src="/flowlog-logo.png"
              alt="FlowLog"
              className={styles.logoIcon}
              style={{ height: '36px', width: 'auto' }}
            />
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
