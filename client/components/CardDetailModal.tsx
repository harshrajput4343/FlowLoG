'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, Label, User } from '@/types';
import styles from './CardDetailModal.module.css';

interface Props {
  card: Card;
  boardLabels: Label[];
  boardMembers: User[];
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: () => void;
}

export const CardDetailModal = ({ card, boardLabels, boardMembers, onClose, onUpdate, onDelete }: Props) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [editingDesc, setEditingDesc] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);

  // Close when clicking outside check
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSaveTitle = () => {
    if (title !== card.title) {
      onUpdate({ ...card, title });
    }
  };

  const handleSaveDesc = () => {
    onUpdate({ ...card, description });
    setEditingDesc(false);
  };

  const toggleLabel = (label: Label) => {
    const hasLabel = card.labels.some(l => l.id === label.id);
    let newLabels;
    if (hasLabel) {
      newLabels = card.labels.filter(l => l.id !== label.id);
    } else {
      newLabels = [...card.labels, label];
    }
    onUpdate({ ...card, labels: newLabels });
  };

  const toggleMember = (member: User) => {
    const hasMember = card.members.some(m => m.id === member.id);
    let newMembers;
    if (hasMember) {
      newMembers = card.members.filter(m => m.id !== member.id);
    } else {
      newMembers = [...card.members, member];
    }
    onUpdate({ ...card, members: newMembers });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} ref={modalRef}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        {/* Header */}
        <div className={styles.headerSection}>
          <span className={styles.headerIcon}>💳</span>
          <input
            className={styles.titleInput}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
          />
          <div className={styles.subtitle}>
            in list <span style={{ textDecoration: 'underline' }}>To Do</span>
          </div>
        </div>

        <div className={styles.mainContainer}>
          <div className={styles.mainColumn}>
            {/* Metadata (Members, Labels) */}
            <div className={styles.metadata}>
              <div className={styles.metaGroup}>
                <div className={styles.metaLabel}>Members</div>
                <div className={styles.memberList}>
                  {card.members.map(m => (
                    <div key={m.id} className={styles.memberAvatar} title={m.name}>
                      {m.avatarUrl ? <img src={m.avatarUrl} alt="" className={styles.memberAvatar} /> : m.name[0]}
                    </div>
                  ))}
                  <button className={styles.metaBtn} onClick={() => setShowMemberMenu(!showMemberMenu)}>+</button>

                  {showMemberMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '120px',
                      left: '40px',
                      background: '#282e33',
                      zIndex: 100,
                      padding: '8px',
                      borderRadius: '4px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                      width: '200px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Members</div>
                      {boardMembers.map(m => (
                        <div
                          key={m.id}
                          style={{ padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                          onClick={() => toggleMember(m)}
                        >
                          <div style={{ width: '24px', height: '24px', background: '#ccc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '12px' }}>{m.name[0]}</div>
                          <span style={{ flex: 1 }}>{m.name}</span>
                          {card.members.some(cm => cm.id === m.id) && <span>✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.metaGroup}>
                <div className={styles.metaLabel}>Labels</div>
                <div className={styles.labelList}>
                  {card.labels.map(l => (
                    <div key={l.id} className={styles.labelChip} style={{ backgroundColor: l.color }}>
                      {l.name}
                    </div>
                  ))}
                  <button className={styles.metaBtn} onClick={() => setShowLabelMenu(!showLabelMenu)}>+</button>

                  {showLabelMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '120px',
                      left: '200px',
                      background: '#282e33',
                      zIndex: 100,
                      padding: '8px',
                      borderRadius: '4px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                      width: '200px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Labels</div>
                      {boardLabels.map(l => (
                        <div
                          key={l.id}
                          style={{ padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                          onClick={() => toggleLabel(l)}
                        >
                          <div style={{ width: '100%', height: '20px', background: l.color, borderRadius: '3px' }}></div>
                          {card.labels.some(cl => cl.id === l.id) && <span>✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={styles.descriptionSection}>
              <span className={styles.headerIcon}>≡</span>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Description</h3>
                {editingDesc && (
                  <button style={{ background: '#579dff', color: '#1d2125', padding: '4px 8px', borderRadius: '3px' }} onClick={handleSaveDesc}>Save</button>
                )}
              </div>
              {editingDesc ? (
                <textarea
                  className={styles.descEditor}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  autoFocus
                  style={{ width: '100%', height: '120px' }}
                />
              ) : (
                <div
                  className={styles.descEditor}
                  onClick={() => setEditingDesc(true)}
                  style={{ cursor: 'pointer' }}
                >
                  {description || 'Add a more detailed description...'}
                </div>
              )}
            </div>

            {/* Checklist Placeholder */}
            {card.checklists?.map(cl => (
              <div key={cl.id} className={styles.checklistSection}>
                <span className={styles.headerIcon}>☑</span>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{cl.title}</h3>
                  <button className={styles.deleteBtn}>Delete</button>
                </div>
                {/* Progress Bar */}
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(cl.items.filter(i => i.isChecked).length / cl.items.length) * 100}%` }}
                  />
                </div>
                {cl.items.map(item => (
                  <div key={item.id} className={styles.checklistItem}>
                    <div className={`${styles.checkbox} ${item.isChecked ? styles.checked : ''}`}>
                      {item.isChecked && '✓'}
                    </div>
                    <span className={`${styles.itemText} ${item.isChecked ? styles.checked : ''}`}>
                      {item.content}
                    </span>
                  </div>
                ))}
                <button className={styles.addItemBtn}>Add an item</button>
              </div>
            ))}

          </div>

          <div className={styles.sidebarColumn}>
            <div className={styles.sidebarGroup}>
              <div className={styles.groupTitle}>Add to card</div>
              <button className={styles.sidebarBtn}>👤 Members</button>
              <button className={styles.sidebarBtn}>🏷️ Labels</button>
              <button className={styles.sidebarBtn}>☑ Checklist</button>
              <button className={styles.sidebarBtn}>🕒 Dates</button>
              <button className={styles.sidebarBtn}>📎 Attachment</button>
              <button className={styles.sidebarBtn}>🖼️ Cover</button>
            </div>

            <div className={styles.sidebarGroup}>
              <div className={styles.groupTitle}>Actions</div>
              <button className={styles.sidebarBtn}>➡️ Move</button>
              <button className={styles.sidebarBtn}>📋 Copy</button>
              <button className={styles.sidebarBtn} onClick={() => { if (confirm('Delete card?')) onDelete(); }}>
                🗑️ Delete
              </button>
              <button className={styles.sidebarBtn}>Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
