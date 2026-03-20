'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { apiClient } from '@/utils/api';
import { isPremiumUser } from '@/utils/premiumGate';
import { PremiumGateModal } from '@/components/PremiumGateModal';
import { useToast } from '@/contexts/ToastContext';
import styles from './page.module.css';

interface TemplateList {
  title: string;
  cards: string[];
}

interface Template {
  id: number;
  title: string;
  description: string;
  author: string;
  category: string;
  tag: string;
  bg: string;
  isPremium: boolean;
  lists: TemplateList[];
}

const CATEGORIES = [
  { name: 'All', icon: '✨', color: '#579dff' },
  { name: 'Business', icon: '💼', color: '#eb5a46' },
  { name: 'Design', icon: '🎨', color: '#f2d600' },
  { name: 'Education', icon: '🎓', color: '#00c2e0' },
  { name: 'Engineering', icon: '⚙️', color: '#51e898' },
  { name: 'Marketing', icon: '📢', color: '#c377e0' },
  { name: 'Project Management', icon: '📊', color: '#0079bf' },
  { name: 'Remote Work', icon: '🏠', color: '#519839' },
  { name: 'Sales', icon: '💹', color: '#61bd4f' },
];

const TEMPLATES: Template[] = [
  {
    id: 1,
    title: 'Project Management',
    description: 'A comprehensive project management board to track tasks from backlog to completion. Perfect for teams of any size.',
    author: 'FlowLog Team',
    category: 'Project Management',
    tag: 'Popular',
    bg: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)',
    isPremium: false,
    lists: [
      { title: 'Backlog', cards: ['Research competitors', 'Define project scope', 'Gather requirements'] },
      { title: 'To Do', cards: ['Create wireframes', 'Set up CI/CD', 'Write API docs'] },
      { title: 'In Progress', cards: ['Build landing page', 'Implement auth'] },
      { title: 'Done', cards: ['Project kickoff', 'Team onboarding'] }
    ]
  },
  {
    id: 2,
    title: 'Kanban Template',
    description: 'Simple and effective Kanban board for agile development teams. Visualize workflow and limit work in progress.',
    author: 'Engineering',
    category: 'Engineering',
    tag: 'Agile',
    bg: 'linear-gradient(135deg, #d29034 0%, #f5a623 100%)',
    isPremium: false,
    lists: [
      { title: 'To Do', cards: ['Sprint planning', 'Code review guidelines', 'Update dependencies'] },
      { title: 'Doing', cards: ['Feature development', 'Bug fixes'] },
      { title: 'Done', cards: ['Release v1.0', 'Setup monitoring'] }
    ]
  },
  {
    id: 3,
    title: 'Design Huddle',
    description: 'Collaborative board for design teams to share inspiration, track design progress, and manage reviews.',
    author: 'Design Team',
    category: 'Design',
    tag: 'Team',
    bg: 'linear-gradient(135deg, #cd5a91 0%, #ff78cb 100%)',
    isPremium: false,
    lists: [
      { title: 'Inspiration', cards: ['Dribbble collection', 'Brand mood boards', 'Color palette ideas'] },
      { title: 'In Progress', cards: ['Homepage redesign', 'Icon set v2'] },
      { title: 'Review', cards: ['Mobile nav mockup', 'Dashboard layout'] },
      { title: 'Published', cards: ['Logo refresh', 'Style guide v3'] }
    ]
  },
  {
    id: 4,
    title: 'Go To Market Strategy',
    description: 'Plan and execute your product launch with this structured go-to-market strategy board.',
    author: 'Marketing',
    category: 'Marketing',
    tag: 'Planning',
    bg: 'linear-gradient(135deg, #00aecc 0%, #51e898 100%)',
    isPremium: false,
    lists: [
      { title: 'Research', cards: ['Market analysis', 'Competitor audit', 'Target persona'] },
      { title: 'Strategy', cards: ['Pricing model', 'Channel strategy', 'Messaging framework'] },
      { title: 'Execution', cards: ['Press release draft', 'Social media plan'] },
      { title: 'Launch', cards: ['Launch day checklist', 'Post-launch review'] }
    ]
  },
  {
    id: 5,
    title: 'Remote Team Hub',
    description: 'Keep your remote team aligned and connected with a centralized hub for updates and resources.',
    author: 'HR',
    category: 'Remote Work',
    tag: 'Remote',
    bg: 'linear-gradient(135deg, #519839 0%, #61bd4f 100%)',
    isPremium: false,
    lists: [
      { title: 'Announcements', cards: ['New hire welcome', 'Policy update', 'Holiday schedule'] },
      { title: 'This Week', cards: ['Sprint goals', 'Team standup notes'] },
      { title: 'Async Updates', cards: ['Design review summary', 'QA report'] },
      { title: 'Resources', cards: ['Onboarding guide', 'Tool access links', 'Team directory'] }
    ]
  },
  {
    id: 6,
    title: 'Weekly Meeting',
    description: 'Run efficient meetings with structured agendas, action items, and decision tracking.',
    author: 'Operations',
    category: 'Business',
    tag: 'Meeting',
    bg: 'linear-gradient(135deg, #172b4d 0%, #0052cc 100%)',
    isPremium: false,
    lists: [
      { title: 'Agenda', cards: ['Status updates', 'Blockers discussion', 'New initiatives'] },
      { title: 'Action Items', cards: ['Follow up with client', 'Update roadmap'] },
      { title: 'Decisions', cards: ['Approved Q2 budget', 'New tool adoption'] },
      { title: 'Parking Lot', cards: ['Office redesign', 'Team offsite planning'] }
    ]
  },
  {
    id: 7,
    title: 'Software Sprint',
    description: 'Plan and track software sprints with dedicated lists for development, code review, and QA stages.',
    author: 'Engineering',
    category: 'Engineering',
    tag: 'Engineering',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    isPremium: true,
    lists: [
      { title: 'Sprint Backlog', cards: ['User auth flow', 'API rate limiting', 'Database optimization'] },
      { title: 'In Development', cards: ['Payment integration', 'Dashboard widgets'] },
      { title: 'Code Review', cards: ['PR #142: Auth refactor'] },
      { title: 'QA', cards: ['Regression testing', 'Performance benchmarks'] },
      { title: 'Done', cards: ['Login page', 'User settings'] }
    ]
  },
  {
    id: 8,
    title: 'Content Calendar',
    description: 'Plan, write, review, and schedule content across all your channels with this editorial calendar.',
    author: 'Marketing',
    category: 'Marketing',
    tag: 'Marketing',
    bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    isPremium: true,
    lists: [
      { title: 'Ideas', cards: ['How-to guide series', 'Case study: Acme Corp', 'Infographic: Industry trends'] },
      { title: 'Writing', cards: ['Blog: Best practices', 'Newsletter draft'] },
      { title: 'Review', cards: ['Social media batch'] },
      { title: 'Scheduled', cards: ['Twitter thread: Tips', 'LinkedIn article'] },
      { title: 'Published', cards: ['Q1 recap blog', 'Product launch post'] }
    ]
  },
  {
    id: 9,
    title: 'OKR Tracker',
    description: 'Track objectives and key results to align your team and measure progress against goals.',
    author: 'Leadership',
    category: 'Business',
    tag: 'Business',
    bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    isPremium: false,
    lists: [
      { title: 'Objectives', cards: ['Increase user retention', 'Launch mobile app', 'Expand to EU market'] },
      { title: 'Key Results', cards: ['Retention +15%', '10K app downloads', '3 EU partnerships'] },
      { title: 'On Track', cards: ['Mobile app beta complete'] },
      { title: 'At Risk', cards: ['EU compliance review'] },
      { title: 'Done', cards: ['Q4 retention target hit'] }
    ]
  },
  {
    id: 10,
    title: 'Bug Tracker',
    description: 'Streamline bug reporting and resolution with structured triage, assignment, and tracking workflows.',
    author: 'QA Team',
    category: 'Engineering',
    tag: 'Engineering',
    bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    isPremium: false,
    lists: [
      { title: 'Reported', cards: ['Login timeout on mobile', 'CSS misalignment', 'Slow query on dashboard'] },
      { title: 'Triaging', cards: ['Memory leak in worker', 'OAuth redirect issue'] },
      { title: 'In Progress', cards: ['Fix payment rounding'] },
      { title: 'Fixed', cards: ['Pagination off-by-one', 'Dark mode toggle'] },
      { title: 'Closed', cards: ['Image upload crash'] }
    ]
  },
  {
    id: 11,
    title: 'Onboarding Checklist',
    description: 'Ensure smooth employee onboarding with a structured checklist from pre-start through first month.',
    author: 'HR',
    category: 'Business',
    tag: 'HR',
    bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    isPremium: false,
    lists: [
      { title: 'Pre-Start', cards: ['Send welcome email', 'Prepare workstation', 'Create accounts'] },
      { title: 'Week 1', cards: ['Team introductions', 'Setup dev environment', 'First standup'] },
      { title: 'Week 2', cards: ['First code review', 'Shadow senior dev', 'Learn deployment process'] },
      { title: 'Month 1', cards: ['First feature shipped', '1-on-1 with manager', 'Feedback session'] },
      { title: 'Complete', cards: ['Onboarding survey'] }
    ]
  },
  {
    id: 12,
    title: 'Personal Goals',
    description: 'Track personal goals and habits with a simple board that keeps you accountable and focused.',
    author: 'FlowLog Team',
    category: 'Education',
    tag: 'Education',
    bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    isPremium: false,
    lists: [
      { title: 'Someday', cards: ['Learn piano', 'Write a book', 'Run a marathon'] },
      { title: 'This Month', cards: ['Read 3 books', 'Complete online course'] },
      { title: 'This Week', cards: ['Workout 4x', 'Meal prep Sunday'] },
      { title: 'Today', cards: ['Morning meditation', 'Review flashcards'] },
      { title: 'Done', cards: ['10K steps streak', 'Coursera certificate'] }
    ]
  },
];

export default function Templates() {
  const router = useRouter();
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredTemplates = TEMPLATES.slice(0, 4);

  const handleTemplateClick = (template: Template) => {
    if (template.isPremium && !isPremiumUser()) {
      setShowPremiumGate(true);
      return;
    }
    setSelectedTemplate(template);
    setBoardTitle(template.title);
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplate || !boardTitle.trim()) return;
    setCreating(true);
    try {
      // Create the board
      const board = await apiClient.createBoard(boardTitle.trim(), selectedTemplate.bg);

      // Create lists and cards sequentially
      for (const listData of selectedTemplate.lists) {
        const list = await apiClient.createList(listData.title, board.id);
        for (const cardTitle of listData.cards) {
          await apiClient.createCard(cardTitle, list.id);
        }
      }

      addToast(`Board "${boardTitle}" created from template!`, 'success');
      setSelectedTemplate(null);
      router.push(`/b/${board.id}`);
    } catch (err) {
      addToast('Failed to create board from template. Please try again.', 'error');
    }
    setCreating(false);
  };

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

          {/* Search */}
          <div className={styles.searchSection}>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Category Chips */}
          <div className={styles.categoryChips}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                className={`${styles.categoryChip} ${selectedCategory === cat.name ? styles.categoryChipActive : ''}`}
                onClick={() => setSelectedCategory(cat.name)}
                style={selectedCategory === cat.name ? { borderColor: cat.color, color: cat.color } : {}}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>

          {/* Featured Section */}
          {selectedCategory === 'All' && !searchQuery && (
            <div className={styles.featuredSection}>
              <div className={styles.sectionTitle}>⭐ Featured Templates</div>
              <div className={styles.featuredGrid}>
                {featuredTemplates.map(template => (
                  <div
                    key={template.id}
                    className={styles.featuredCard}
                    onClick={() => handleTemplateClick(template)}
                  >
                    <div className={styles.featuredPreview} style={{ background: template.bg }}>
                      <span className={styles.templateTag}>{template.tag}</span>
                      {template.isPremium && <span className={styles.premiumBadge}>👑 PRO</span>}
                      <div className={styles.featuredOverlay}>
                        <span className={styles.useTemplateText}>Use template</span>
                      </div>
                    </div>
                    <div className={styles.templateInfo}>
                      <div className={styles.templateTitle}>{template.title}</div>
                      <div className={styles.templateAuthor}>By {template.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Templates */}
          <div className={styles.featuredSection}>
            <div className={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Templates' : `${selectedCategory} Templates`}
              <span className={styles.count}> ({filteredTemplates.length})</span>
            </div>
            <div className={styles.templateGrid}>
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={styles.templateCard}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className={styles.templatePreview} style={{ background: template.bg }}>
                    <span className={styles.templateTag}>{template.tag}</span>
                    {template.isPremium && <span className={styles.premiumBadge}>👑 PRO</span>}
                    <div className={styles.cardOverlay}>
                      <span className={styles.useTemplateText}>Use template</span>
                    </div>
                  </div>
                  <div className={styles.templateInfo}>
                    <div className={styles.templateTitle}>{template.title}</div>
                    <div className={styles.templateAuthor}>By {template.author}</div>
                  </div>
                </div>
              ))}
            </div>
            {filteredTemplates.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <p>No templates found for &quot;{searchQuery || selectedCategory}&quot;</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Template Modal */}
      {selectedTemplate && (
        <div className={styles.modalOverlay} onClick={() => !creating && setSelectedTemplate(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => !creating && setSelectedTemplate(null)}>×</button>

            <div className={styles.modalLayout}>
              {/* Left: Preview */}
              <div className={styles.modalPreview}>
                <div className={styles.previewBoard} style={{ background: selectedTemplate.bg }}>
                  <div className={styles.previewTitle}>{selectedTemplate.title}</div>
                  <div className={styles.previewLists}>
                    {selectedTemplate.lists.map((list, i) => (
                      <div key={i} className={styles.previewList}>
                        <div className={styles.previewListTitle}>{list.title}</div>
                        {list.cards.slice(0, 3).map((card, j) => (
                          <div key={j} className={styles.previewCard}>{card}</div>
                        ))}
                        {list.cards.length > 3 && (
                          <div className={styles.previewMore}>+{list.cards.length - 3} more</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Details */}
              <div className={styles.modalDetails}>
                <h2 className={styles.modalTitle}>{selectedTemplate.title}</h2>
                <div className={styles.modalMeta}>
                  <span className={styles.modalAuthor}>By {selectedTemplate.author}</span>
                  <span className={styles.modalCategory}>{selectedTemplate.category}</span>
                </div>
                <p className={styles.modalDescription}>{selectedTemplate.description}</p>

                <div className={styles.listsPreview}>
                  <strong>This template includes {selectedTemplate.lists.length} lists:</strong>
                  <div className={styles.listNames}>
                    {selectedTemplate.lists.map((l, i) => (
                      <span key={i} className={styles.listBadge}>{l.title}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.createSection}>
                  <label className={styles.inputLabel}>Board Title</label>
                  <input
                    type="text"
                    value={boardTitle}
                    onChange={e => setBoardTitle(e.target.value)}
                    className={styles.boardInput}
                    placeholder="Enter board title..."
                  />
                  <button
                    className={styles.useTemplateBtn}
                    onClick={handleUseTemplate}
                    disabled={creating || !boardTitle.trim()}
                  >
                    {creating ? (
                      <span className={styles.spinner}>Creating board...</span>
                    ) : (
                      'Use Template'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Gate Modal */}
      <PremiumGateModal
        isOpen={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        featureName="Premium Templates"
      />
    </div>
  );
}
