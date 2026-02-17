'use client';
import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { List, Card } from '@/types';
import { CardItem } from './CardItem';
import styles from './ListColumn.module.css';

const LIST_COLORS = [
  { name: 'Blue', color: '#0079bf' },
  { name: 'Green', color: '#216E4E' },
  { name: 'Yellow', color: '#F5CD47' },
  { name: 'Orange', color: '#ff9f1a' },
  { name: 'Red', color: '#eb5a46' },
  { name: 'Purple', color: '#6E5DC6' },
  { name: 'Pink', color: '#ff78cb' },
  { name: 'Sky', color: '#00c2e0' },
  { name: 'Dark', color: '#1F262C' },
  { name: 'Lime', color: '#51e898' },
];

interface Props {
  list: List;
  index: number;
  onAddCard: (listId: number, title: string) => Promise<void>;
  onUpdateList: (listId: number, title: string) => Promise<void>;
  onDeleteList: (listId: number) => Promise<void>;
  onUpdateListColor: (listId: number, color: string | null) => Promise<void>;
  onCardClick: (card: Card) => void;
}

export const ListColumn = ({ list, index, onAddCard, onUpdateList, onDeleteList, onUpdateListColor, onCardClick }: Props) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSaveTitle = async () => {
    if (title.trim() && title !== list.title) {
      await onUpdateList(list.id, title.trim());
    }
    setEditingTitle(false);
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;
    await onAddCard(list.id, newCardTitle.trim());
    setNewCardTitle('');
    setAddingCard(false);
  };

  const handleDeleteList = async () => {
    if (confirm(`Delete list "${list.title}" and all its cards?`)) {
      await onDeleteList(list.id);
    }
    setShowMenu(false);
  };

  const handleColorSelect = async (color: string | null) => {
    await onUpdateListColor(list.id, color);
    setShowColorPicker(false);
    setShowMenu(false);
  };

  // Determine if header color is dark to use white text
  const isDarkColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  const headerColor = list.color || null;
  const headerStyle = headerColor ? {
    backgroundColor: headerColor,
    color: isDarkColor(headerColor) ? '#ffffff' : '#172b4d',
  } : {};

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={styles.container}
        >
          <div
            className={styles.header}
            style={headerStyle}
            {...provided.dragHandleProps}
          >
            {editingTitle ? (
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
                className={styles.titleInput}
                autoFocus
              />
            ) : (
              <h2
                className={styles.title}
                onClick={() => setEditingTitle(true)}
                style={headerColor ? { color: isDarkColor(headerColor) ? '#ffffff' : '#172b4d' } : {}}
              >
                {list.title}
              </h2>
            )}
            <div className={styles.headerActions}>
              <button className={styles.actionBtn} title="Sparkle" style={headerColor ? { color: isDarkColor(headerColor) ? '#ffffff' : '#172b4d' } : {}}>✦</button>
              <div className={styles.menuWrapper}>
                <button
                  className={styles.menu}
                  onClick={() => { setShowMenu(!showMenu); setShowColorPicker(false); }}
                  style={headerColor ? { color: isDarkColor(headerColor) ? '#ffffff' : '#172b4d' } : {}}
                >
                  ⋯
                </button>
                {showMenu && (
                  <div className={styles.dropdown}>
                    <button onClick={() => { setEditingTitle(true); setShowMenu(false); }}>
                      Edit title
                    </button>
                    <button onClick={() => setShowColorPicker(!showColorPicker)}>
                      🎨 Change color
                    </button>
                    {showColorPicker && (
                      <div className={styles.colorPickerGrid}>
                        {LIST_COLORS.map(c => (
                          <div
                            key={c.color}
                            className={`${styles.colorSwatch} ${list.color === c.color ? styles.colorSwatchActive : ''}`}
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                            onClick={() => handleColorSelect(c.color)}
                          />
                        ))}
                        {list.color && (
                          <button
                            className={styles.removeColorBtn}
                            onClick={() => handleColorSelect(null)}
                          >
                            ✕ Remove color
                          </button>
                        )}
                      </div>
                    )}
                    <button className={styles.deleteBtn} onClick={handleDeleteList}>
                      Delete list
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Droppable droppableId={list.id.toString()} type="CARD">
            {(provided, snapshot) => (
              <div
                className={`${styles.cardList} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {list.cards.map((card, idx) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    index={idx}
                    onClick={() => onCardClick(card)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className={styles.footer}>
            {addingCard ? (
              <div className={styles.addCardForm}>
                <textarea
                  placeholder="Enter a title for this card..."
                  value={newCardTitle}
                  onChange={e => setNewCardTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard();
                    }
                  }}
                  autoFocus
                />
                <div className={styles.addCardActions}>
                  <button onClick={handleAddCard}>Add Card</button>
                  <button onClick={() => setAddingCard(false)}>×</button>
                </div>
              </div>
            ) : (
              <button
                className={styles.addCardBtn}
                onClick={() => setAddingCard(true)}
              >
                + Add a card
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
