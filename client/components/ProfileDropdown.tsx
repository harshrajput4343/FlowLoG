'use client';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './ProfileDropdown.module.css';

interface Props {
  onClose: () => void;
}

export const ProfileDropdown = ({ onClose }: Props) => {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.dropdown}>
        {/* Account Section */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>ACCOUNT</div>
          <div className={styles.userRow}>
            <div className={styles.avatar}>HK</div>
            <div className={styles.userInfo}>
              <span className={styles.name}>Harsh Kumar</span>
              <span className={styles.email}>harsh@example.com</span>
            </div>
          </div>
          <button className={styles.menuItem}>
            Switch accounts
          </button>
          <button className={styles.menuItem}>
            Manage account
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
            </svg>
          </button>
        </div>

        {/* FlowLog Section */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>FLOWLOG</div>
          <button className={styles.menuItem}>Profile and visibility</button>
          <button className={styles.menuItem}>Activity</button>
          <button className={styles.menuItem}>Cards</button>
          <button className={styles.menuItem}>Settings</button>

          {/* Theme Selector */}
          <div className={styles.themeSection}>
            <span className={styles.themeLabel}>Theme</span>
            <div className={styles.themeOptions}>
              <button
                className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => setTheme('light')}
                title="Light"
              >
                <div className={styles.themePreview} style={{ background: '#ffffff', border: '1px solid #dfe1e6' }}>
                  <div className={styles.themeGrid}>
                    <div style={{ background: '#0079bf' }} />
                    <div style={{ background: '#0079bf' }} />
                    <div style={{ background: '#0079bf' }} />
                  </div>
                </div>
                {theme === 'light' && <span className={styles.checkmark}>✓</span>}
              </button>
              <button
                className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => setTheme('dark')}
                title="Dark"
              >
                <div className={styles.themePreview} style={{ background: '#1d2125' }}>
                  <div className={styles.themeGrid}>
                    <div style={{ background: '#579dff' }} />
                    <div style={{ background: '#579dff' }} />
                    <div style={{ background: '#579dff' }} />
                  </div>
                </div>
                {theme === 'dark' && <span className={styles.checkmark}>✓</span>}
              </button>
              <button
                className={`${styles.themeOption} ${theme === 'system' ? styles.active : ''}`}
                onClick={() => setTheme('system')}
                title="Match system"
              >
                <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #ffffff 50%, #1d2125 50%)' }}>
                  <div className={styles.systemIcon}>💻</div>
                </div>
                {theme === 'system' && <span className={styles.checkmark}>✓</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className={styles.section}>
          <button className={styles.menuItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z" />
            </svg>
            Create Workspace
          </button>
          <button className={styles.menuItem}>Help</button>
          <button className={styles.menuItem}>Shortcuts</button>
        </div>

        <div className={styles.section}>
          <button className={styles.menuItem}>Log out</button>
        </div>
      </div>
    </>
  );
};
