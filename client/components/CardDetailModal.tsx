'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [addingItemToChecklist, setAddingItemToChecklist] = useState<number | null>(null);
  const [newItemContent, setNewItemContent] = useState('');

  // New member creation state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  // Label editing state
  const [editingLabelId, setEditingLabelId] = useState<number | null>(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editLabelColor, setEditLabelColor] = useState('');
  const [localLabels, setLocalLabels] = useState(boardLabels);

  const modalRef = useRef<HTMLDivElement>(null);
  const memberMenuRef = useRef<HTMLDivElement>(null);
  const labelMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalLabels(boardLabels);
  }, [boardLabels]);

  // Fetch all users for the Members popup
  useEffect(() => {
    apiClient.getUsers().then(users => {
      if (Array.isArray(users)) setAllUsers(users);
    }).catch(console.error);
  }, []);

  // Close modal on outside click (but not when clicking inside label/member menus)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close member menu on outside click
  useEffect(() => {
    if (!showMemberMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (memberMenuRef.current && !memberMenuRef.current.contains(event.target as Node)) {
        setShowMemberMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMemberMenu]);

  // Close label menu on outside click
  useEffect(() => {
    if (!showLabelMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (labelMenuRef.current && !labelMenuRef.current.contains(event.target as Node)) {
        setShowLabelMenu(false);
        setEditingLabelId(null);
        setShowCreateLabel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLabelMenu]);

  const handleSaveTitle = () => {
    if (title !== card.title) {
      onUpdate({ ...card, title });
    }
  };

  const handleSaveDesc = async () => {
    try {
      await apiClient.updateCard(card.id, { description });
      onUpdate({ ...card, description });
      setEditingDesc(false);
    } catch (err) {
      console.error('Failed to save description:', err);
    }
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
      setLocalLabels([...localLabels, newLabel]);
      setNewLabelName('');
      setShowCreateLabel(false);
      onLabelsChange?.();
    } catch (err) {
      console.error('Failed to create label:', err);
    }
  };

  const startEditLabel = (label: Label, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLabelId(label.id);
    setEditLabelName(label.name || '');
    setEditLabelColor(label.color);
  };

  const handleUpdateLabel = async () => {
    if (!editingLabelId || !editLabelName.trim()) return;
    try {
      await apiClient.updateLabel(editingLabelId, editLabelName, editLabelColor);
      // Update local labels
      setLocalLabels(localLabels.map(l =>
        l.id === editingLabelId ? { ...l, name: editLabelName, color: editLabelColor } : l
      ));
      // Update card labels if this label is on the card
      const updatedCardLabels = card.labels.map(l =>
        l.id === editingLabelId ? { ...l, name: editLabelName, color: editLabelColor } : l
      );
      onUpdate({ ...card, labels: updatedCardLabels });
      setEditingLabelId(null);
      onLabelsChange?.();
    } catch (err) {
      console.error('Failed to update label:', err);
    }
  };

  const handleDeleteLabel = async (labelId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this label from all cards?')) return;
    try {
      await apiClient.deleteLabel(labelId);
      setLocalLabels(localLabels.filter(l => l.id !== labelId));
      const updatedCardLabels = card.labels.filter(l => l.id !== labelId);
      onUpdate({ ...card, labels: updatedCardLabels });
      onLabelsChange?.();
    } catch (err) {
      console.error('Failed to delete label:', err);
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

  const handleToggleChecklistItem = async (checklistId: number, itemId: number) => {
    try {
      await apiClient.toggleChecklistItem(itemId);
      const updatedChecklists = (card.checklists || []).map(cl => {
        if (cl.id === checklistId) {
          return {
            ...cl,
            items: cl.items.map(item =>
              item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
            )
          };
        }
        return cl;
      });
      onUpdate({ ...card, checklists: updatedChecklists });
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
    }
  };

  const handleAddChecklistItem = async (checklistId: number) => {
    if (!newItemContent.trim()) return;
    try {
      const newItem = await apiClient.addChecklistItem(checklistId, newItemContent.trim());
      const updatedChecklists = (card.checklists || []).map(cl => {
        if (cl.id === checklistId) {
          return { ...cl, items: [...cl.items, newItem] };
        }
        return cl;
      });
      onUpdate({ ...card, checklists: updatedChecklists });
      setNewItemContent('');
      setAddingItemToChecklist(null);
    } catch (err) {
      console.error('Failed to add checklist item:', err);
    }
  };

  const handleDeleteChecklist = async (checklistId: number) => {
    try {
      await apiClient.deleteChecklist(checklistId);
      const updatedChecklists = (card.checklists || []).filter(cl => cl.id !== checklistId);
      onUpdate({ ...card, checklists: updatedChecklists });
    } catch (err) {
      console.error('Failed to delete checklist:', err);
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
                <div className={styles.metaLabel}>MEMBERS</div>
                <div className={styles.memberList}>
                  {card.members.map(m => (
                    <div key={m.id} className={styles.memberAvatar} title={m.name}>
                      {m.avatarUrl ? <img src={m.avatarUrl} alt="" className={styles.memberAvatar} /> : m.name[0]}
                    </div>
                  ))}
                  <button className={styles.metaBtn} onClick={() => setShowMemberMenu(prev => !prev)}>+</button>

                  {showMemberMenu && (
                    <div ref={memberMenuRef} className={styles.popupMenu} style={{ left: '0' }} onClick={e => e.stopPropagation()}>
                      <div className={styles.popupHeader}>Members</div>
                      {allUsers.length > 0 ? allUsers.map(m => (
                        <div
                          key={m.id}
                          className={styles.popupItem}
                          onClick={() => toggleMember(m)}
                        >
                          <div className={styles.popupAvatar}>{m.name[0]}</div>
                          <span style={{ flex: 1 }}>{m.name}</span>
                          {card.members.some(cm => cm.id === m.id) && <span style={{ color: '#61bd4f' }}>✓</span>}
                        </div>
                      )) : (
                        <div style={{ color: '#9fadbc', fontSize: '13px', padding: '8px' }}>No users found</div>
                      )}

                      <div className={styles.popupDivider}></div>

                      {!showAddMember ? (
                        <button
                          className={styles.createLabelBtn}
                          onClick={() => { setShowAddMember(true); setMemberError(''); }}
                        >
                          + Add a new member
                        </button>
                      ) : (
                        <div className={styles.createLabelForm}>
                          {memberError && (
                            <div style={{ color: '#ff5630', fontSize: '12px', padding: '0 4px' }}>{memberError}</div>
                          )}
                          <input
                            type="text"
                            placeholder="Name"
                            value={newMemberName}
                            onChange={e => setNewMemberName(e.target.value)}
                            className={styles.labelInput}
                            autoFocus
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={newMemberEmail}
                            onChange={e => setNewMemberEmail(e.target.value)}
                            className={styles.labelInput}
                          />
                          <div className={styles.createLabelActions}>
                            <button
                              onClick={async () => {
                                if (!newMemberName.trim() || !newMemberEmail.trim()) {
                                  setMemberError('Name and email are required');
                                  return;
                                }
                                try {
                                  const newUser = await apiClient.createUser(newMemberName.trim(), newMemberEmail.trim());
                                  setAllUsers([...allUsers, newUser]);
                                  setNewMemberName('');
                                  setNewMemberEmail('');
                                  setShowAddMember(false);
                                  setMemberError('');
                                } catch (err: any) {
                                  setMemberError(err.message || 'Failed to add member');
                                }
                              }}
                              className={styles.createBtn}
                            >Add</button>
                            <button onClick={() => { setShowAddMember(false); setMemberError(''); }} className={styles.cancelBtn}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.metaGroup}>
                <div className={styles.metaLabel}>LABELS</div>
                <div className={styles.labelList}>
                  {card.labels.map(l => (
                    <div key={l.id} className={styles.labelChip} style={{ backgroundColor: l.color }}>
                      {l.name}
                    </div>
                  ))}
                  <button className={styles.metaBtn} onClick={() => setShowLabelMenu(prev => !prev)}>+</button>

                  {showLabelMenu && (
                    <div ref={labelMenuRef} className={styles.popupMenu} style={{ left: '100px' }} onClick={e => e.stopPropagation()}>
                      <div className={styles.popupHeader}>Labels</div>

                      {/* Editing a label */}
                      {editingLabelId !== null ? (
                        <div className={styles.createLabelForm}>
                          <div className={styles.labelPreview} style={{ backgroundColor: editLabelColor }}>
                            {editLabelName || 'Preview'}
                          </div>
                          <input
                            type="text"
                            placeholder="Label name..."
                            value={editLabelName}
                            onChange={(e) => setEditLabelName(e.target.value)}
                            className={styles.labelInput}
                            autoFocus
                          />
                          <div className={styles.colorGrid}>
                            {LABEL_COLORS.map(c => (
                              <div
                                key={c.color}
                                className={`${styles.colorOption} ${editLabelColor === c.color ? styles.colorSelected : ''}`}
                                style={{ backgroundColor: c.color }}
                                onClick={() => setEditLabelColor(c.color)}
                                title={c.name}
                              />
                            ))}
                          </div>
                          <div className={styles.createLabelActions}>
                            <button onClick={handleUpdateLabel} className={styles.createBtn}>Save</button>
                            <button onClick={() => setEditingLabelId(null)} className={styles.cancelBtn}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Existing labels */}
                          {localLabels.map(l => (
                            <div
                              key={l.id}
                              className={styles.popupItem}
                              onClick={() => toggleLabel(l)}
                            >
                              <div className={styles.labelColor} style={{ backgroundColor: l.color }}></div>
                              <span style={{ flex: 1 }}>{l.name || 'Unnamed'}</span>
                              {card.labels.some(cl => cl.id === l.id) && <span style={{ color: '#61bd4f' }}>✓</span>}
                              <button
                                className={styles.editLabelBtn}
                                onClick={(e) => startEditLabel(l, e)}
                                title="Edit label"
                              >
                                ✏️
                              </button>
                              <button
                                className={styles.deleteLabelBtn}
                                onClick={(e) => handleDeleteLabel(l.id, e)}
                                title="Delete label"
                              >
                                🗑️
                              </button>
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
                              <div className={styles.labelPreview} style={{ backgroundColor: selectedColor }}>
                                {newLabelName || 'Preview'}
                              </div>
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
                        </>
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
                  <button className={styles.saveBtn} onClick={handleSaveDesc}>Save</button>
                )}
              </div>
              {editingDesc ? (
                <textarea
                  className={styles.descEditor}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  autoFocus
                  placeholder="Add a more detailed description..."
                />
              ) : (
                <div
                  className={styles.descPlaceholder}
                  onClick={() => setEditingDesc(true)}
                >
                  {description || 'Add a more detailed description...'}
                </div>
              )}
            </div>

            {/* Checklists */}
            {card.checklists?.map(cl => {
              const checkedCount = cl.items.filter(i => i.isChecked).length;
              const totalCount = cl.items.length;
              const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
              const allDone = totalCount > 0 && checkedCount === totalCount;
              return (
                <div key={cl.id} className={styles.checklistSection}>
                  <span className={styles.headerIcon}>📋</span>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>{cl.title}</h3>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteChecklist(cl.id)}>Delete</button>
                  </div>
                  <div className={styles.progressRow}>
                    <span className={styles.progressPercent}>{Math.round(progressPercent)}%</span>
                    <div className={styles.progressBar}>
                      <div
                        className={`${styles.progressFill} ${allDone ? styles.progressComplete : ''}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  {cl.items.map(item => (
                    <div
                      key={item.id}
                      className={styles.checklistItem}
                      onClick={() => handleToggleChecklistItem(cl.id, item.id)}
                    >
                      <div className={`${styles.checkbox} ${item.isChecked ? styles.checked : ''}`}>
                        {item.isChecked && '✓'}
                      </div>
                      <span className={`${styles.itemText} ${item.isChecked ? styles.checked : ''}`}>
                        {item.content}
                      </span>
                    </div>
                  ))}
                  {addingItemToChecklist === cl.id ? (
                    <div className={styles.addItemForm}>
                      <input
                        type="text"
                        placeholder="Add an item..."
                        value={newItemContent}
                        onChange={e => setNewItemContent(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddChecklistItem(cl.id)}
                        className={styles.addItemInput}
                        autoFocus
                      />
                      <div className={styles.addItemActions}>
                        <button onClick={() => handleAddChecklistItem(cl.id)} className={styles.createBtn}>Add</button>
                        <button onClick={() => { setAddingItemToChecklist(null); setNewItemContent(''); }} className={styles.cancelBtn}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className={styles.addItemBtn} onClick={() => setAddingItemToChecklist(cl.id)}>Add an item</button>
                  )}
                </div>
              );
            })}

          </div>

          <div className={styles.sidebarColumn}>
            <div className={styles.sidebarGroup}>
              <div className={styles.groupTitle}>Add to card</div>
              <button className={styles.sidebarBtn} onClick={() => setShowMemberMenu(prev => !prev)}>
                👤 Members
              </button>
              <button className={styles.sidebarBtn} onClick={() => setShowLabelMenu(prev => !prev)}>
                🏷️ Labels
              </button>
              <button className={styles.sidebarBtn} onClick={() => setShowChecklistInput(!showChecklistInput)}>
                ☑ Checklist
              </button>
              <button className={styles.sidebarBtn} onClick={() => setShowDatePicker(!showDatePicker)}>
                🕒 Dates
              </button>
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
              <button className={styles.sidebarBtn} onClick={() => { if (confirm('Delete card?')) onDelete(); }}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
