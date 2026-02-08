'use client';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './page.module.css';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.layoutContainer}>
      <Header />
      <div className={styles.contentContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle}>Workspace Settings</h1>

          {/* Theme Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Theme</h2>
            <p className={styles.sectionDesc}>
              Choose your preferred color theme for the application.
            </p>

            <div className={styles.themeGrid}>
              <button
                className={`${styles.themeCard} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className={styles.themePreview} style={{ background: '#f1f2f4' }}>
                  <div className={styles.previewHeader} style={{ background: '#ffffff' }} />
                  <div className={styles.previewContent}>
                    <div className={styles.previewCard} style={{ background: '#ffffff' }} />
                    <div className={styles.previewCard} style={{ background: '#ffffff' }} />
                    <div className={styles.previewCard} style={{ background: '#ffffff' }} />
                  </div>
                </div>
                <div className={styles.themeInfo}>
                  <span className={styles.themeName}>Light</span>
                  {theme === 'light' && <span className={styles.themeCheck}>✓</span>}
                </div>
              </button>

              <button
                className={`${styles.themeCard} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className={styles.themePreview} style={{ background: '#1d2125' }}>
                  <div className={styles.previewHeader} style={{ background: '#1d2125' }} />
                  <div className={styles.previewContent}>
                    <div className={styles.previewCard} style={{ background: '#22272b' }} />
                    <div className={styles.previewCard} style={{ background: '#22272b' }} />
                    <div className={styles.previewCard} style={{ background: '#22272b' }} />
                  </div>
                </div>
                <div className={styles.themeInfo}>
                  <span className={styles.themeName}>Dark</span>
                  {theme === 'dark' && <span className={styles.themeCheck}>✓</span>}
                </div>
              </button>

              <button
                className={`${styles.themeCard} ${theme === 'system' ? styles.active : ''}`}
                onClick={() => setTheme('system')}
              >
                <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #f1f2f4 50%, #1d2125 50%)' }}>
                  <div className={styles.systemIcon}>💻</div>
                </div>
                <div className={styles.themeInfo}>
                  <span className={styles.themeName}>Match System</span>
                  {theme === 'system' && <span className={styles.themeCheck}>✓</span>}
                </div>
              </button>
            </div>
          </section>

          {/* Workspace Settings */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Workspace Details</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>Workspace Name</label>
              <input
                type="text"
                defaultValue="FlowLog Workspace"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Workspace Description</label>
              <textarea
                placeholder="Add a description..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            <button className={styles.saveBtn}>Save Changes</button>
          </section>

          {/* Danger Zone */}
          <section className={styles.dangerSection}>
            <h2 className={styles.sectionTitle}>Danger Zone</h2>
            <p className={styles.dangerDesc}>
              Once you delete a workspace, there is no going back. Please be certain.
            </p>
            <button className={styles.deleteBtn}>Delete Workspace</button>
          </section>
        </main>
      </div>
    </div>
  );
}
