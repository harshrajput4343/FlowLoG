'use client';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import styles from './page.module.css';

const CATEGORIES = [
  { name: 'Business', icon: '💼', color: '#eb5a46' },
  { name: 'Design', icon: '🎨', color: '#f2d600' },
  { name: 'Education', icon: '🎓', color: '#00c2e0' },
  { name: 'Engineering', icon: '⚙️', color: '#51e898' },
  { name: 'Marketing', icon: '📢', color: '#c377e0' },
  { name: 'Project Management', icon: '📊', color: '#0079bf' },
  { name: 'Remote Work', icon: '🏠', color: '#519839' },
  { name: 'Sales', icon: '💹', color: '#61bd4f' },
];

const TEMPLATES = [
  {
    id: 1,
    title: 'Project Management',
    author: 'FlowLog Team',
    bg: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)',
    tag: 'Popular'
  },
  {
    id: 2,
    title: 'Kanban Template',
    author: 'Engineering',
    bg: 'linear-gradient(135deg, #d29034 0%, #f5a623 100%)',
    tag: 'Agile'
  },
  {
    id: 3,
    title: 'Design Huddle',
    author: 'Design Team',
    bg: 'linear-gradient(135deg, #cd5a91 0%, #ff78cb 100%)',
    tag: 'Team'
  },
  {
    id: 4,
    title: 'Go To Market Strategy',
    author: 'Marketing',
    bg: 'linear-gradient(135deg, #00aecc 0%, #51e898 100%)',
    tag: 'Planning'
  },
  {
    id: 5,
    title: 'Remote Team Hub',
    author: 'HR',
    bg: 'linear-gradient(135deg, #519839 0%, #61bd4f 100%)',
    tag: 'Remote'
  },
  {
    id: 6,
    title: 'Weekly Meeting',
    author: 'Operations',
    bg: 'linear-gradient(135deg, #172b4d 0%, #0052cc 100%)',
    tag: 'Meeting'
  },
];

export default function Templates() {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      <div className={styles.contentContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>Templates</h1>
              <div className={styles.subtitle}>Featured templates from the FlowLog community</div>
            </div>
          </div>

          <div className={styles.featuredSection}>
            <div className={styles.sectionTitle}>Featured categories</div>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <div key={cat.name} className={styles.categoryCard}>
                  <div className={styles.categoryIcon} style={{ background: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className={styles.categoryName}>{cat.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.featuredSection}>
            <div className={styles.sectionTitle}>New and notable templates</div>
            <div className={styles.templateGrid}>
              {TEMPLATES.map(template => (
                <div key={template.id} className={styles.templateCard}>
                  <div className={styles.templatePreview} style={{ background: template.bg }}>
                    <span className={styles.templateTag}>{template.tag}</span>
                  </div>
                  <div className={styles.templateInfo}>
                    <div className={styles.templateTitle}>{template.title}</div>
                    <div className={styles.templateAuthor}>By {template.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
