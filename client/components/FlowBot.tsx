'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import styles from './FlowBot.module.css';

/* ─── Static Knowledge Base ─── */
interface KBEntry {
  keywords: string[];
  answer: string;
}

const KB: KBEntry[] = [
  {
    keywords: ['create board', 'new board', 'add board', 'make board', 'board', 'boards'],
    answer:
      '📋 **Creating a Board**\n\nClick the **"Create"** button in the top-right header. Give your board a name and optionally pick a background color or image. Hit create and you\'re ready to go!\n\nYou can also create a board from the **"+ Create new board"** card on the dashboard.',
  },
  {
    keywords: ['template', 'templates', 'use template'],
    answer:
      '📄 **Using Templates**\n\nOn the dashboard, scroll to the **"Most popular templates"** section. Click any template to preview it, then set a board title and hit **"Use Template"**. FlowLog will create a new board pre-loaded with lists and cards.',
  },
  {
    keywords: ['list', 'add list', 'create list', 'new list', 'column'],
    answer:
      '📝 **Adding Lists**\n\nOpen a board and click **"+ Add a list"** on the right side. Type a title and press Enter. Lists act as columns — use them for stages like "To Do", "In Progress", and "Done".',
  },
  {
    keywords: ['card', 'add card', 'new card', 'create card', 'task'],
    answer:
      '🃏 **Adding Cards**\n\nClick **"+ Add a card"** at the bottom of any list. Type a title and press Enter. Click any card to open its detail view where you can add descriptions, labels, checklists, and due dates.',
  },
  {
    keywords: ['drag', 'drop', 'move card', 'reorder', 'move list'],
    answer:
      '🔄 **Drag & Drop**\n\nGrab any card and drag it to another list or reorder it within the same list. You can also drag entire lists to rearrange them. FlowLog saves the order automatically.',
  },
  {
    keywords: ['label', 'labels', 'color label', 'tag'],
    answer:
      '🏷️ **Labels**\n\nOpen a card and click **"Labels"** to assign color-coded tags. You can create custom labels with names like "Bug", "Feature", or "Urgent". Labels help you filter and visually categorize your work.',
  },
  {
    keywords: ['checklist', 'todo', 'check list', 'subtask'],
    answer:
      '✅ **Checklists**\n\nOpen a card and click **"Checklist"** to add subtasks. Check off items as you complete them — FlowLog shows a progress bar so you can track completion at a glance.',
  },
  {
    keywords: ['due date', 'deadline', 'calendar', 'date'],
    answer:
      '📅 **Due Dates**\n\nOpen a card and click **"Due Date"** to set a deadline. Cards with due dates show a badge on the board. Overdue cards are highlighted in red so nothing slips through.',
  },
  {
    keywords: ['member', 'invite', 'team', 'share', 'collaborate'],
    answer:
      '👥 **Inviting Members**\n\nGo to the **Members** page in the sidebar. Enter a teammate\'s email and send an invitation. They\'ll receive an email link to join your workspace and collaborate on boards.',
  },
  {
    keywords: ['theme', 'dark mode', 'light mode', 'appearance', 'dark', 'light'],
    answer:
      '🎨 **Themes**\n\nClick your **profile avatar** in the top-right corner, then go to **Settings**. Under "Appearance", choose between **Light**, **Dark**, or **System** theme. Changes apply instantly.',
  },
  {
    keywords: ['search', 'find board', 'find card'],
    answer:
      '🔍 **Search**\n\nUse the **search bar** in the header to quickly find boards by name. Start typing and matching boards appear instantly in a dropdown. Click any result to jump to that board.',
  },
  {
    keywords: ['premium', 'upgrade', 'pro', 'pricing', 'plan', 'subscription'],
    answer:
      '💎 **Upgrading to Pro**\n\nClick **"Upgrade"** in the sidebar or visit the **Pricing** page. Pro gives you unlimited boards, advanced automation, priority support, and more. You can pay monthly or yearly.',
  },
  {
    keywords: ['background', 'wallpaper', 'board background', 'customize'],
    answer:
      '🖼️ **Board Backgrounds**\n\nWhen creating a board, you can pick a gradient color or upload a custom image as the background. This makes it easy to visually distinguish between different projects.',
  },
  {
    keywords: ['delete', 'remove board', 'delete board', 'archive'],
    answer:
      '🗑️ **Deleting a Board**\n\nOpen the board you want to remove. Click the board menu (⋯) and select **"Delete Board"**. This action is permanent, so make sure you\'ve saved anything important first.',
  },
  {
    keywords: ['keyboard', 'shortcut', 'shortcuts'],
    answer:
      '⌨️ **Keyboard Shortcuts**\n\n• **Enter** — Submit a new card or list\n• **Escape** — Close modals and cancel edits\n• **Drag** — Click and hold to move cards/lists\n\nMore shortcuts are coming in future updates!',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help', 'what can you do', 'how do i'],
    answer:
      '👋 **Hey there! I\'m FlowGuide.**\n\nI can help you learn how to use FlowLog. Try asking me about:\n\n• Creating boards, lists & cards\n• Using templates\n• Drag & drop\n• Labels, checklists & due dates\n• Inviting team members\n• Themes & settings\n• Upgrading to Pro',
  },
];

const QUICK_TOPICS = [
  'Create a board',
  'Use templates',
  'Add labels',
  'Invite members',
  'Themes',
  'Shortcuts',
];

/* ─── Matcher ─── */
function findAnswer(input: string): string {
  const q = input.toLowerCase().trim();
  if (!q) return '';
  const qWords = q.split(/\s+/);

  // Score each entry by how many keyword phrases match
  let bestScore = 0;
  let bestAnswer = '';

  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keywords) {
      // Exact substring match (highest confidence)
      if (q.includes(kw)) {
        score += kw.split(' ').length * 2;
        continue;
      }
      // Word-level match: all words in the keyword appear in the query
      const kwWords = kw.split(' ');
      const allPresent = kwWords.every(w => qWords.includes(w));
      if (allPresent) {
        score += kwWords.length * 1.5;
        continue;
      }
      // Partial: at least one word of the keyword is in the query
      const overlap = kwWords.filter(w => qWords.includes(w)).length;
      if (overlap > 0) {
        score += overlap * 0.5;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = entry.answer;
    }
  }

  if (bestAnswer) return bestAnswer;

  return "🤔 I'm not sure about that one. Try asking about **boards**, **cards**, **templates**, **labels**, **members**, **themes**, or **shortcuts** — I can help with all of those!";
}

/* ─── Simple markdown-to-HTML ─── */
function renderMarkdown(text: string) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ─── Component ─── */
interface Message {
  from: 'bot' | 'user';
  text: string;
}

const WELCOME: Message = {
  from: 'bot',
  text: "👋 **Hi! I'm FlowGuide** — your FlowLog assistant.\n\nAsk me anything about how to use FlowLog, or pick a topic below to get started!",
};

export const FlowBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { from: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate a small delay for natural feel
    setTimeout(() => {
      const answer = findAnswer(text);
      setMessages(prev => [...prev, { from: 'bot', text: answer }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* ── Chat Window ── */}
      {open && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderAvatar}>💬</div>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatHeaderName}>FlowGuide</div>
              <div className={styles.chatHeaderStatus}>Online</div>
            </div>
            <button className={styles.chatClose} onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={styles.chatMessages}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === 'bot' ? styles.msgBot : styles.msgUser}>
                {renderMarkdown(msg.text)}

                {/* Show quick actions after the first bot message */}
                {msg.from === 'bot' && i === 0 && (
                  <div className={styles.quickActions}>
                    {QUICK_TOPICS.map(topic => (
                      <button
                        key={topic}
                        className={styles.quickAction}
                        onClick={() => send(topic)}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className={styles.typing}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className={styles.chatInputRow} onSubmit={handleSubmit}>
            <input
              className={styles.chatInput}
              type="text"
              placeholder="Ask about FlowLog..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <button
              className={styles.chatSendBtn}
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        className={`${styles.botFab} ${open ? styles.open : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Open FlowGuide chatbot"
      >
        <span className={styles.fabIcon}>
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
};
