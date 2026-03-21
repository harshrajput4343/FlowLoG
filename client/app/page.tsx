'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { CreateBoardModal } from '@/components/CreateBoardModal';
import { apiClient } from '@/utils/api';
import { Board } from '@/types';
import styles from './page.module.css';

const HOME_TEMPLATES = [
  {
    id: 1,
    title: 'Project Management',
    bg: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
    lists: [
      { title: 'Backlog', cards: ['Define project scope', 'Gather requirements', 'Set milestones'] },
      { title: 'To Do', cards: ['Create wireframes', 'Setup repository', 'Write tech specs'] },
      { title: 'In Progress', cards: ['Build core features', 'Design UI components'] },
      { title: 'Done', cards: ['Project kickoff meeting', 'Team onboarding'] }
    ]
  },
  {
    id: 2,
    title: 'Daily Task Management',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    lists: [
      { title: 'Today', cards: ['Morning standup', 'Review pull requests', 'Update documentation'] },
      { title: 'This Week', cards: ['Sprint planning', 'Code review session', 'Weekly report'] },
      { title: 'Someday', cards: ['Learn TypeScript', 'Refactor auth module', 'Write unit tests'] },
      { title: 'Done', cards: ['Setup dev environment', 'Fix login bug'] }
    ]
  },
  {
    id: 3,
    title: 'Remote Team Hub',
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    lists: [
      { title: 'Announcements', cards: ['Q4 goals published', 'New team member joining', 'Holiday schedule'] },
      { title: 'This Week', cards: ['Product demo prep', 'Client call Thursday', 'Deploy v2.1'] },
      { title: 'Async Updates', cards: ['Backend API complete', 'Design review done'] },
      { title: 'Resources', cards: ['Onboarding guide', 'Team handbook', 'Tech stack docs'] }
    ]
  }
];

interface RecentBoard {
  id: number;
  title: string;
  background?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof HOME_TEMPLATES[0] | null>(null);
  const [templateBoardTitle, setTemplateBoardTitle] = useState('');
  const [creatingFromTemplate, setCreatingFromTemplate] = useState(false);

  useEffect(() => {
    apiClient.getBoards().then(data => setBoards(Array.isArray(data) ? data : [])).catch(() => setBoards([]));

    // Load recent boards from localStorage
    const recent = JSON.parse(localStorage.getItem('recentBoards') || '[]');
    setRecentBoards(recent);
  }, []);

  const handleBoardCreated = () => {
    apiClient.getBoards().then(data => setBoards(Array.isArray(data) ? data : [])).catch(() => setBoards([]));
    setShowCreateModal(false);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate || !templateBoardTitle.trim()) return;
    const token = localStorage.getItem('authToken');
    if (!token || token === 'guest-token') {
      router.push('/login');
      return;
    }
    setCreatingFromTemplate(true);
    try {
      const board = await apiClient.createBoard(templateBoardTitle.trim(), selectedTemplate.bg);
      for (const listData of selectedTemplate.lists) {
        const list = await apiClient.createList(listData.title, board.id);
        for (const cardTitle of listData.cards) {
          await apiClient.createCard(cardTitle, list.id);
        }
      }
      setSelectedTemplate(null);
      router.push('/b/' + board.id);
    } catch (err) {
      console.error('Failed to create board from template:', err);
      setCreatingFromTemplate(false);
    }
  };

  const getBackgroundStyle = (background?: string) => {
    if (!background) return { background: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' };
    if (background.startsWith('linear')) return { background };
    if (background.startsWith('url')) return { backgroundImage: background, backgroundSize: 'cover' };
    if (background.startsWith('#')) return { background };
    return { background: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' };
  };

  return (
    <div className={styles.layoutContainer}>
      <Header />
      <div className={styles.contentContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          {/* Workspace Header */}
          <div className={styles.workspaceHeader}>
            <div className={styles.workspaceLogo}>F</div>
            <div className={styles.workspaceInfo}>
              <h1 className={styles.workspaceName}>FlowLog Workspace</h1>
              <span className={styles.workspaceType}>Free</span>
            </div>
          </div>

          {/* Recently Viewed Section */}
          {recentBoards.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={styles.sectionIcon}>
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                <h2 className={styles.sectionTitle}>Recently viewed</h2>
              </div>

              <div className={styles.boardGrid}>
                {recentBoards.slice(0, 4).map(board => (
                  <Link
                    key={board.id}
                    href={`/b/${board.id}`}
                    className={styles.boardCard}
                    style={getBackgroundStyle(board.background)}
                  >
                    <div className={styles.boardCardTitle}>{board.title}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Most Popular Templates Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={styles.sectionIcon}>
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              <h2 className={styles.sectionTitle}>Most popular templates</h2>
            </div>
            <p className={styles.sectionDesc}>Get going faster with a template from the FlowLog community</p>

            <div className={styles.templateGrid}>
              {HOME_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className={styles.templateCard}
                  style={{ background: template.bg, cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setTemplateBoardTitle(template.title);
                  }}
                >
                  <span className={styles.templateLabel}>TEMPLATE</span>
                  <div className={styles.templateName}>{template.title}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Your Boards Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={styles.sectionIcon}>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <h2 className={styles.sectionTitle}>Your boards</h2>
            </div>

            <div className={styles.boardGrid}>
              {boards.map(board => (
                <Link
                  key={board.id}
                  href={`/b/${board.id}`}
                  className={styles.boardCard}
                  style={getBackgroundStyle(board.background)}
                >
                  <div className={styles.boardCardTitle}>{board.title}</div>
                </Link>
              ))}

              <button
                className={styles.createBoardCard}
                onClick={() => {
                  const token = typeof window !== 'undefined' && localStorage.getItem('authToken');
                  if (!token || token === 'guest-token') {
                    router.push('/login');
                  } else {
                    setShowCreateModal(true);
                  }
                }}
              >
                <span>Create new board</span>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Template Modal */}
      {selectedTemplate && (
        <div className={styles.templateModalOverlay} onClick={() => setSelectedTemplate(null)}>
          <div className={styles.templateModal} onClick={e => e.stopPropagation()}>
            <button className={styles.templateModalClose} onClick={() => setSelectedTemplate(null)}>×</button>
            <div className={styles.templateModalPreview} style={{ background: selectedTemplate.bg }}>
              <div className={styles.templateModalLists}>
                {selectedTemplate.lists.map(list => (
                  <div key={list.title} className={styles.templateModalList}>
                    <div className={styles.templateModalListTitle}>{list.title}</div>
                    {list.cards.slice(0, 2).map(card => (
                      <div key={card} className={styles.templateModalCard}>{card}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.templateModalContent}>
              <h2 className={styles.templateModalTitle}>{selectedTemplate.title}</h2>
              <p className={styles.templateModalDesc}>
                Includes {selectedTemplate.lists.length} lists: {selectedTemplate.lists.map(l => l.title).join(', ')}
              </p>
              <label className={styles.templateModalLabel}>Board Title</label>
              <input
                type="text"
                value={templateBoardTitle}
                onChange={e => setTemplateBoardTitle(e.target.value)}
                className={styles.templateModalInput}
                placeholder="Enter board title..."
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleUseTemplate()}
              />
              <button
                className={styles.templateModalBtn}
                onClick={handleUseTemplate}
                disabled={!templateBoardTitle.trim() || creatingFromTemplate}
              >
                {creatingFromTemplate ? 'Creating board...' : 'Use Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleBoardCreated}
        />
      )}
    </div>
  );
}
