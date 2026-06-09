'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import styles from './FlowGuide.module.css';

/* ── Types ── */
interface Message {
  role: 'user' | 'assistant';
  text: string;
}

/* ── Constants ── */
const API_BASE =
  typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://127.0.0.1:3001/api';

const WELCOME_MSG: Message = {
  role: 'assistant',
  text: '✨ Hi! I\'m FlowGuide AI — I can answer questions about your boards, cards, and tasks using real data.\n\nTry one of the suggestions below, or ask anything!',
};

const QUICK_SUGGESTIONS = [
  'How many boards do I have?',
  'Show me overdue cards',
  'How many tasks are incomplete?',
  'Which list has the most cards?',
];

/* ── Component ── */
export const FlowGuide = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check auth status on mount + when window regains focus
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        setIsAuthenticated(!!localStorage.getItem('authToken'));
      }
    };
    checkAuth();
    window.addEventListener('focus', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('focus', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'assistant', text: 'Please log in to use FlowGuide AI.' },
      ]);
      return;
    }

    // Add user message immediately
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/flowguide/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: 'Your session has expired. Please log in again.' },
        ]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer || "I couldn't process that. Try asking about your boards, lists, or cards.",
        },
      ]);
    } catch (err) {
      console.error('FlowGuide fetch error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Something went wrong while connecting. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── Chat Panel ── */}
      {open && (
        <div className={styles.chatWindow} id="flowguide-chat-panel">
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderAvatar}>🤖</div>
            <div className={styles.chatHeaderInfo}>
              <div className={styles.chatHeaderName}>FlowGuide AI</div>
              <div className={styles.chatHeaderTag}>Data Assistant</div>
            </div>
            <button
              className={styles.chatClose}
              onClick={() => setOpen(false)}
              aria-label="Close FlowGuide"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={styles.chatMessages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === 'assistant' ? styles.msgAssistant : styles.msgUser
                }
              >
                {msg.text}

                {/* Quick suggestions after the first welcome message */}
                {msg.role === 'assistant' && i === 0 && messages.length === 1 && (
                  <div className={styles.suggestions}>
                    {QUICK_SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        className={styles.suggestion}
                        onClick={() => sendMessage(q)}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
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
              placeholder="Ask about your data..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
              id="flowguide-chat-input"
            />
            <button
              className={styles.chatSendBtn}
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              id="flowguide-send-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        className={`${styles.guideFab} ${open ? styles.open : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Open FlowGuide AI"
        id="flowguide-fab"
      >
        <span className={styles.fabIcon}>
          {open ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a2 2 0 0 1-2 2h-1l-2 5h-4l-2-5H7a2 2 0 0 1-2-2v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4z" />
              <circle cx="9" cy="9" r="1" fill="currentColor" />
              <circle cx="15" cy="9" r="1" fill="currentColor" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
};
