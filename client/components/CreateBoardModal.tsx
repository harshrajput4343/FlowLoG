'use client';
import { useState } from 'react';
import { apiClient } from '@/utils/api';
import styles from './CreateBoardModal.module.css';

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

const BACKGROUNDS = [
  'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)',
  'linear-gradient(135deg, #d29034 0%, #89609e 100%)',
  'linear-gradient(135deg, #519839 0%, #49852e 100%)',
  'linear-gradient(135deg, #b04632 0%, #89609e 100%)',
  'linear-gradient(135deg, #89609e 0%, #5067c5 100%)',
  'linear-gradient(135deg, #cd5a91 0%, #5067c5 100%)',
  'linear-gradient(135deg, #00aecc 0%, #5067c5 100%)',
  'linear-gradient(135deg, #172b4d 0%, #0052cc 100%)',
];

export const CreateBoardModal = ({ onClose, onCreated }: Props) => {
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await apiClient.createBoard(title, background);
      if (onCreated) {
        onCreated();
      } else {
        onClose();
        if (window.location.pathname === '/' || window.location.pathname === '/home') {
          window.location.reload();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Create board</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div className={styles.content}>
          <div className={styles.preview} style={{ background }}>
            <svg width="186" height="120" viewBox="0 0 186 120" fill="none" opacity="0.4">
              <rect x="8" y="8" width="50" height="104" rx="4" fill="white" />
              <rect x="68" y="8" width="50" height="80" rx="4" fill="white" />
              <rect x="128" y="8" width="50" height="60" rx="4" fill="white" />
            </svg>
          </div>

          <label className={styles.bgLabel}>Background</label>
          <div className={styles.bgGrid}>
            {BACKGROUNDS.slice(0, 4).map((bg, i) => (
              <div
                key={i}
                className={`${styles.bgOption} ${background === bg ? styles.selected : ''}`}
                style={{ background: bg }}
                onClick={() => setBackground(bg)}
              />
            ))}
          </div>

          <label className={styles.inputLabel}>Board title <span className={styles.required}>*</span></label>
          <input
            type="text"
            className={styles.input}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter board title"
            autoFocus
          />
          {!title.trim() && (
            <p className={styles.hint}>👋 Board title is required</p>
          )}

          <button
            className={styles.createBtn}
            disabled={!title.trim() || loading}
            onClick={handleCreate}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
