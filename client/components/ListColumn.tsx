'use client';
import { useState } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { List, Card } from '@/types';
import { CardItem } from './CardItem';
import styles from './ListColumn.module.css';

interface Props {
  list: List;
  index: number;
  onAddCard: (listId: number, title: string) => Promise<void>;
  onUpdateList: (listId: number, title: string) => Promise<void>;
  onDeleteList: (listId: number) => Promise<void>;
  onCardClick: (card: Card) => void;
}

export const ListColumn = ({ list, index, onAddCard, onUpdateList, onDeleteList, onCardClick }: Props) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [addingCard, setAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

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

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided) => {
        const titleLower = list.title.toLowerCase();
        let colorClass = '';
        if (titleLower.includes('starter guide')) colorClass = styles.purple;
        else if (titleLower.includes('today')) colorClass = styles.yellow;
        else if (titleLower.includes('this week')) colorClass = styles.green;
        else if (titleLower.includes('later')) colorClass = styles.dark;

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`${styles.container} ${colorClass}`}
          >
            <div className={`${styles.header} ${colorClass}`} {...provided.dragHandleProps}>
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
                >
                  {list.title}
                </h2>
              )}
              <div className={styles.headerActions}>
                <button className={styles.actionBtn} title="Sparkle">✦</button>
                <div className={styles.menuWrapper}>
                  <button
                    className={styles.menu}
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    ⋯
                  </button>
                  {showMenu && (
                    <div className={styles.dropdown}>
                      <button onClick={() => { setEditingTitle(true); setShowMenu(false); }}>
                        Edit title
                      </button>
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
        );
      }}
    </Draggable>
  );
};
