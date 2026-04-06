'use client';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './page.module.css';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  // Workspace state — persisted in localStorage (no DB table yet)
  const [workspaceName, setWorkspaceName] = useState('FlowLog Workspace');
  const [workspaceDesc, setWorkspaceDesc] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load saved values from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('workspaceName');
    const savedDesc = localStorage.getItem('workspaceDesc');
    if (savedName) setWorkspaceName(savedName);
    if (savedDesc) setWorkspaceDesc(savedDesc);
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Persist to localStorage for now (UI state across pages)
      localStorage.setItem('workspaceName', workspaceName.trim() || 'FlowLog Workspace');
      localStorage.setItem('workspaceDesc', workspaceDesc);

      // Dispatch storage event so Sidebar picks it up immediately
      window.dispatchEvent(new Event('storage'));

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  };

  const getSaveBtnLabel = () => {
    if (saveStatus === 'saving') return 'Saving...';
    if (saveStatus === 'saved') return '✓ Saved!';
    if (saveStatus === 'error') return 'Error — Try Again';
    return 'Save Changes';
  };

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
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className={styles.input}
                placeholder="e.g. My Team Workspace"
                maxLength={60}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Workspace Description</label>
              <textarea
                value={workspaceDesc}
                onChange={(e) => setWorkspaceDesc(e.target.value)}
                placeholder="Add a description..."
                className={styles.textarea}
                rows={3}
                maxLength={200}
              />
            </div>

            <button
              className={`${styles.saveBtn} ${saveStatus === 'saved' ? styles.saveBtnSuccess : ''} ${saveStatus === 'error' ? styles.saveBtnError : ''}`}
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
            >
              {getSaveBtnLabel()}
            </button>
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
