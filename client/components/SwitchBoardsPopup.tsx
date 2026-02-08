'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/utils/api';
import { Board } from '@/types';
import styles from './SwitchBoardsPopup.module.css';

interface Props {
  currentBoardId: number;
  onClose: () => void;
}

interface RecentBoard {
  id: number;
  title: string;
  background?: string;
}

export const SwitchBoardsPopup = ({ currentBoardId, onClose }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [boards, setBoards] = useState<Board[]>([]);
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'workspace'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load boards
    apiClient.getBoards().then(data => {
      setBoards(data);
      setLoading(false);
    }).catch(console.error);

    // Load recent boards from localStorage
    const recent = JSON.parse(localStorage.getItem('recentBoards') || '[]');
    setRecentBoards(recent.filter((b: RecentBoard) => b.id !== currentBoardId));
  }, [currentBoardId]);

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    board.id !== currentBoardId
  );

  const getBackgroundStyle = (background?: string) => {
    if (!background) return { background: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' };
    if (background.startsWith('linear')) return { background };
    if (background.startsWith('url')) return { backgroundImage: background, backgroundSize: 'cover' };
    if (background.startsWith('#')) return { background };
    return { background: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' };
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.popup}>
        {/* Search */}
        <div className={styles.searchContainer}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            placeholder="Search your boards"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <div className={styles.iconButtons}>
            <button className={styles.iconBtn} title="List view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </button>
            <button className={styles.iconBtn} title="Sort">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${activeFilter === 'all' ? styles.active : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterTab} ${activeFilter === 'workspace' ? styles.active : ''}`}
            onClick={() => setActiveFilter('workspace')}
          >
            FlowLog Workspace
          </button>
        </div>

        {/* Recent Section */}
        {recentBoards.length > 0 && !searchQuery && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
              <span>Recent</span>
            </div>
            <div className={styles.boardGrid}>
              {recentBoards.slice(0, 4).map(board => (
                <Link
                  key={board.id}
                  href={`/b/${board.id}`}
                  className={styles.boardCard}
                  onClick={onClose}
                >
                  <div
                    className={styles.boardPreview}
                    style={getBackgroundStyle(board.background)}
                  />
                  <div className={styles.boardTitle}>{board.title}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Workspace Section */}
        <div className={styles.section}>
          <button className={styles.workspaceHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
            </svg>
            <span>FlowLog Workspace</span>
          </button>

          {loading ? (
            <div className={styles.loading}>Loading boards...</div>
          ) : (
            <div className={styles.boardList}>
              {filteredBoards.map(board => (
                <Link
                  key={board.id}
                  href={`/b/${board.id}`}
                  className={styles.boardListItem}
                  onClick={onClose}
                >
                  <div
                    className={styles.boardListPreview}
                    style={getBackgroundStyle(board.background)}
                  />
                  <span className={styles.boardListTitle}>{board.title}</span>
                </Link>
              ))}
              {filteredBoards.length === 0 && !loading && (
                <div className={styles.noResults}>No boards found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
