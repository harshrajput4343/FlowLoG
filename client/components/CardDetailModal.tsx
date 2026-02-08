'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, Label, User } from '@/types';
import { apiClient } from '@/utils/api';
import styles from './CardDetailModal.module.css';

interface Props {
  card: Card;
  boardId: number;
  boardLabels: Label[];
  boardMembers: User[];
  onClose: () => void;
  onUpdate: (card: Card) => void;
  onDelete: () => void;
  onLabelsChange?: () => void;
}

// Preset colors for labels like Trello
const LABEL_COLORS = [
  { name: 'Green', color: '#61bd4f' },
  { name: 'Yellow', color: '#f2d600' },
  { name: 'Orange', color: '#ff9f1a' },
  { name: 'Red', color: '#eb5a46' },
  { name: 'Purple', color: '#c377e0' },
  { name: 'Blue', color: '#0079bf' },
  { name: 'Sky', color: '#00c2e0' },
  { name: 'Lime', color: '#51e898' },
  { name: 'Pink', color: '#ff78cb' },
  { name: 'Black', color: '#344563' },
];

export const CardDetailModal = ({
  card,
  boardId,
  boardLabels,
  boardMembers,
  onClose,
  onUpdate,
  onDelete,
  onLabelsChange
}: Props) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [editingDesc, setEditingDesc] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].color);
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(card.dueDate || '');

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

  const toggleLabel = async (label: Label) => {
    const hasLabel = card.labels.some(l => l.id === label.id);
    if (hasLabel) {
      await apiClient.removeLabelFromCard(card.id, label.id);
      const newLabels = card.labels.filter(l => l.id !== label.id);
      onUpdate({ ...card, labels: newLabels });
    } else {
      await apiClient.addLabelToCard(card.id, label.id);
      const newLabels = [...card.labels, label];
      onUpdate({ ...card, labels: newLabels });
    }
  };

  const toggleMember = async (member: User) => {
    const hasMember = card.members.some(m => m.id === member.id);
    if (hasMember) {
      await apiClient.removeMemberFromCard(card.id, member.id);
      const newMembers = card.members.filter(m => m.id !== member.id);
      onUpdate({ ...card, members: newMembers });
    } else {
      await apiClient.assignMemberToCard(card.id, member.id);
      const newMembers = [...card.members, member];
      onUpdate({ ...card, members: newMembers });
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      const newLabel = await apiClient.createLabel(newLabelName, selectedColor, boardId);
      await apiClient.addLabelToCard(card.id, newLabel.id);
      const updatedLabels = [...card.labels, newLabel];
      onUpdate({ ...card, labels: updatedLabels });
      setNewLabelName('');
      setShowCreateLabel(false);
      onLabelsChange?.();
    } catch (err) {
      console.error('Failed to create label:', err);
    }
  };

  const handleCreateChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      const checklist = await apiClient.createChecklist(newChecklistTitle, card.id);
      const updatedChecklists = [...(card.checklists || []), { ...checklist, items: [] }];
      onUpdate({ ...card, checklists: updatedChecklists });
      setNewChecklistTitle('');
      setShowChecklistInput(false);
    } catch (err) {
      console.error('Failed to create checklist:', err);
    }
  };

  const handleSaveDueDate = async () => {
    try {
      await apiClient.updateCard(card.id, { dueDate: dueDate || null });
      onUpdate({ ...card, dueDate: dueDate || undefined });
      setShowDatePicker(false);
    } catch (err) {
      console.error('Failed to update due date:', err);
    }
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
                    <div className={styles.popupMenu} style={{ left: '0' }}>
                      <div className={styles.popupHeader}>Members</div>
                      {boardMembers.map(m => (
                        <div
                          key={m.id}
                          className={styles.popupItem}
                          onClick={() => toggleMember(m)}
                        >
                          <div className={styles.popupAvatar}>{m.name[0]}</div>
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
                    <div className={styles.popupMenu} style={{ left: '100px' }}>
                      <div className={styles.popupHeader}>Labels</div>

                      {/* Existing labels */}
                      {boardLabels.map(l => (
                        <div
                          key={l.id}
                          className={styles.popupItem}
                          onClick={() => toggleLabel(l)}
                        >
                          <div className={styles.labelColor} style={{ backgroundColor: l.color }}></div>
                          <span style={{ flex: 1 }}>{l.name || 'Unnamed'}</span>
                          {card.labels.some(cl => cl.id === l.id) && <span>✓</span>}
                        </div>
                      ))}

                      <div className={styles.popupDivider}></div>

                      {/* Create new label */}
                      {!showCreateLabel ? (
                        <button
                          className={styles.createLabelBtn}
                          onClick={() => setShowCreateLabel(true)}
                        >
                          + Create a new label
                        </button>
                      ) : (
                        <div className={styles.createLabelForm}>
                          <input
                            type="text"
                            placeholder="Label name..."
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            className={styles.labelInput}
                            autoFocus
                          />
                          <div className={styles.colorGrid}>
                            {LABEL_COLORS.map(c => (
                              <div
                                key={c.color}
                                className={`${styles.colorOption} ${selectedColor === c.color ? styles.colorSelected : ''}`}
                                style={{ backgroundColor: c.color }}
                                onClick={() => setSelectedColor(c.color)}
                                title={c.name}
                              />
                            ))}
                          </div>
                          <div className={styles.createLabelActions}>
                            <button onClick={handleCreateLabel} className={styles.createBtn}>Create</button>
                            <button onClick={() => setShowCreateLabel(false)} className={styles.cancelBtn}>Cancel</button>
                          </div>
                        </div>
                      )}
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

            {/* Checklists */}
            {card.checklists?.map(cl => (
              <div key={cl.id} className={styles.checklistSection}>
                <span className={styles.headerIcon}>☑</span>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>{cl.title}</h3>
                  <button className={styles.deleteBtn} onClick={() => apiClient.deleteChecklist(cl.id)}>Delete</button>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: cl.items.length > 0 ? `${(cl.items.filter(i => i.isChecked).length / cl.items.length) * 100}%` : '0%' }}
                  />
                </div>
                {cl.items.map(item => (
                  <div
                    key={item.id}
                    className={styles.checklistItem}
                    onClick={() => apiClient.toggleChecklistItem(item.id)}
                  >
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
              <button className={styles.sidebarBtn} onClick={() => setShowMemberMenu(!showMemberMenu)}>
                👤 Members
              </button>
              <button className={styles.sidebarBtn} onClick={() => setShowLabelMenu(!showLabelMenu)}>
                🏷️ Labels
              </button>
              <button className={styles.sidebarBtn} onClick={() => setShowChecklistInput(!showChecklistInput)}>
                ☑ Checklist
              </button>
              <button className={styles.sidebarBtn} onClick={() => setShowDatePicker(!showDatePicker)}>
                🕒 Dates
              </button>
              <button className={styles.sidebarBtn}>📎 Attachment</button>
              <button className={styles.sidebarBtn}>🖼️ Cover</button>
            </div>

            {/* Checklist Input */}
            {showChecklistInput && (
              <div className={styles.sidebarInputBox}>
                <input
                  type="text"
                  placeholder="Checklist title..."
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className={styles.sidebarInput}
                  autoFocus
                />
                <div className={styles.sidebarInputActions}>
                  <button onClick={handleCreateChecklist} className={styles.createBtn}>Add</button>
                  <button onClick={() => setShowChecklistInput(false)} className={styles.cancelBtn}>✕</button>
                </div>
              </div>
            )}

            {/* Date Picker */}
            {showDatePicker && (
              <div className={styles.sidebarInputBox}>
                <input
                  type="date"
                  value={dueDate ? dueDate.split('T')[0] : ''}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={styles.sidebarInput}
                />
                <div className={styles.sidebarInputActions}>
                  <button onClick={handleSaveDueDate} className={styles.createBtn}>Save</button>
                  <button onClick={() => setShowDatePicker(false)} className={styles.cancelBtn}>✕</button>
                </div>
              </div>
            )}

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
