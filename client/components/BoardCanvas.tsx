'use client';
import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Board, List, Card, Label, User } from '@/types';
import { ListColumn } from './ListColumn';
import { CardDetailModal } from './CardDetailModal';
import { SwitchBoardsPopup } from './SwitchBoardsPopup';
import { apiClient } from '@/utils/api';
import { Header } from './Header';
import { FilterPopup } from './FilterPopup';
import styles from './BoardCanvas.module.css';

interface Props {
  board: Board;
}

export const BoardCanvas = ({ board: initialBoard }: Props) => {
  const [board, setBoard] = useState(initialBoard);
  const [enabled, setEnabled] = useState(false);
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLabel, setFilterLabel] = useState<number | null>(null);
  const [filterMember, setFilterMember] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSwitchBoards, setShowSwitchBoards] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  // Store recently viewed boards
  useEffect(() => {
    const recentBoards = JSON.parse(localStorage.getItem('recentBoards') || '[]');
    const boardInfo = { id: board.id, title: board.title, background: board.background };
    const filtered = recentBoards.filter((b: { id: number }) => b.id !== board.id);
    const updated = [boardInfo, ...filtered].slice(0, 5);
    localStorage.setItem('recentBoards', JSON.stringify(updated));
  }, [board.id, board.title, board.background]);

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;
    const newList = await apiClient.createList(newListTitle.trim(), board.id);
    setBoard({
      ...board,
      lists: [...board.lists, { ...newList, cards: [] }]
    });
    setNewListTitle('');
    setAddingList(false);
  };

  const handleAddCard = async (listId: number, title: string) => {
    const newCard = await apiClient.createCard(title, listId);
    const updatedLists = board.lists.map(list => {
      if (list.id === listId) {
        return {
          ...list,
          cards: [...list.cards, { ...newCard, labels: [], members: [], checklists: [] }]
        };
      }
      return list;
    });
    setBoard({ ...board, lists: updatedLists });
  };

  const handleUpdateList = async (listId: number, title: string) => {
    await apiClient.updateList(listId, title);
    const updatedLists = board.lists.map(list => {
      if (list.id === listId) {
        return { ...list, title };
      }
      return list;
    });
    setBoard({ ...board, lists: updatedLists });
  };

  const handleDeleteList = async (listId: number) => {
    await apiClient.deleteList(listId);
    setBoard({
      ...board,
      lists: board.lists.filter(list => list.id !== listId)
    });
  };

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };

  const handleCardUpdate = (updatedCard: Card) => {
    const updatedLists = board.lists.map(list => ({
      ...list,
      cards: list.cards.map(card =>
        card.id === updatedCard.id ? updatedCard : card
      )
    }));
    setBoard({ ...board, lists: updatedLists });
    setSelectedCard(updatedCard);
  };

  const handleCardDelete = () => {
    if (!selectedCard) return;
    const updatedLists = board.lists.map(list => ({
      ...list,
      cards: list.cards.filter(card => card.id !== selectedCard.id)
    }));
    setBoard({ ...board, lists: updatedLists });
    setSelectedCard(null);
  };

  const filterCards = useCallback((cards: Card[]) => {
    return cards.filter(card => {
      // Search filter
      if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Label filter
      if (filterLabel && !card.labels.some(l => l.id === filterLabel)) {
        return false;
      }
      // Member filter
      if (filterMember && !card.members.some(m => m.id === filterMember)) {
        return false;
      }
      return true;
    });
  }, [searchQuery, filterLabel, filterMember]);

  const filteredLists = board.lists.map(list => ({
    ...list,
    cards: filterCards(list.cards)
  }));

  if (!enabled) {
    return null;
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'LIST') {
      const newLists = Array.from(board.lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);

      const newBoard = { ...board, lists: newLists };
      setBoard(newBoard);

      const items = newLists.map((list, index) => ({
        id: list.id,
        order: index
      }));
      await apiClient.reorderLists(items, board.id).catch(console.error);
      return;
    }

    if (type === 'CARD') {
      const home = board.lists.find(l => l.id.toString() === source.droppableId);
      const foreign = board.lists.find(l => l.id.toString() === destination.droppableId);

      if (!home || !foreign) return;

      if (source.droppableId === destination.droppableId) {
        const newCards = Array.from(home.cards);
        const [movedCard] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, movedCard);

        const newList = { ...home, cards: newCards };
        const newLists = board.lists.map(list =>
          list.id === newList.id ? newList : list
        );

        setBoard({ ...board, lists: newLists });

        const items = newCards.map((c, i) => ({
          id: c.id,
          order: i,
          listId: home.id
        }));
        await apiClient.reorderCards(items).catch(console.error);
      } else {
        const startCards = Array.from(home.cards);
        const [movedCard] = startCards.splice(source.index, 1);

        const finishCards = Array.from(foreign.cards);
        const newMovedCard = { ...movedCard, listId: foreign.id };
        finishCards.splice(destination.index, 0, newMovedCard);

        const newHome = { ...home, cards: startCards };
        const newForeign = { ...foreign, cards: finishCards };

        const newLists = board.lists.map(list => {
          if (list.id === newHome.id) return newHome;
          if (list.id === newForeign.id) return newForeign;
          return list;
        });

        setBoard({ ...board, lists: newLists });

        const items = finishCards.map((c, i) => ({
          id: c.id,
          order: i,
          listId: foreign.id
        }));
        await apiClient.reorderCards(items).catch(console.error);
      }
    }
  };

  // Compute background style
  const backgroundStyle = board.background?.startsWith('linear')
    ? { background: board.background }
    : board.background?.startsWith('url')
      ? { backgroundImage: board.background, backgroundSize: 'cover', backgroundPosition: 'center' }
      : board.background?.startsWith('#')
        ? { background: board.background }
        : { background: 'linear-gradient(135deg, #0079bf 0%, #5067c5 100%)' };

  return (
    <div className={styles.pageWrapper} style={backgroundStyle}>
      <Header onSearch={setSearchQuery} />

      {/* Board Title Bar */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              className={styles.boardCanvas}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className={styles.boardTitleBar}>
                <h1 className={styles.boardTitle}>{board.title}</h1>
                <button className={styles.workspaceSelector}>
                  🏢 ▾
                </button>
                <div className={styles.boardActions}>
                  {board.members?.map(m => (
                    <div key={m.id} className={styles.memberAvatar} title={m.name || ''}>
                      {m.name?.[0] || '?'}
                    </div>
                  ))}
                  <div style={{ position: 'relative' }}>
                    <button
                      className={`${styles.boardActionBtn} ${showFilters ? styles.active : ''} ${filterLabel || filterMember ? styles.activeFilter : ''}`}
                      onClick={() => setShowFilters(!showFilters)}
                      title="Filter cards"
                    >
                      ⚡
                    </button>
                    {showFilters && (
                      <FilterPopup
                        labels={board.labels || []}
                        members={board.members || []}
                        activeLabel={filterLabel}
                        activeMember={filterMember}
                        onSelectLabel={setFilterLabel}
                        onSelectMember={setFilterMember}
                        onClose={() => setShowFilters(false)}
                      />
                    )}
                  </div>
                  <button className={styles.boardActionBtn}>🔽</button>
                  <button className={styles.boardActionBtn}>☆</button>
                  <button className={styles.shareBtn}>
                    👥 Share
                  </button>
                  <button className={styles.moreBtn}>⋯</button>
                </div>
              </div>

              <div className={styles.listsContainer}>
                {filteredLists.map((list, index) => (
                  <ListColumn
                    key={list.id}
                    list={list}
                    index={index}
                    onAddCard={handleAddCard}
                    onUpdateList={handleUpdateList}
                    onDeleteList={handleDeleteList}
                    onCardClick={handleCardClick}
                  />
                ))}
                {provided.placeholder}
                <div className={styles.addListWrapper}>
                  {addingList ? (
                    <div className={styles.addListForm}>
                      <input
                        type="text"
                        placeholder="Enter list title..."
                        value={newListTitle}
                        onChange={e => setNewListTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddList()}
                        autoFocus
                      />
                      <div className={styles.addListActions}>
                        <button onClick={handleAddList}>Add List</button>
                        <button onClick={() => setAddingList(false)}>×</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className={styles.addListBtn}
                      onClick={() => setAddingList(true)}
                    >
                      + Add another list
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <button className={styles.navTab}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H4.99c-1.11 0-1.98.89-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10z" />
          </svg>
          <span>Inbox</span>
        </button>
        <button className={styles.navTab}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
          </svg>
          <span>Planner</span>
        </button>
        <button className={`${styles.navTab} ${styles.active}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span>Board</span>
        </button>
        <button
          className={styles.navTab}
          onClick={() => setShowSwitchBoards(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
          <span>Switch boards</span>
        </button>
      </nav>

      {/* Switch Boards Popup */}
      {showSwitchBoards && (
        <SwitchBoardsPopup
          currentBoardId={board.id}
          onClose={() => setShowSwitchBoards(false)}
        />
      )}

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          boardId={board.id}
          boardLabels={board.labels || []}
          boardMembers={board.members || []}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}

      {/* Mascot 2026 */}
      <div style={{
        position: 'fixed',
        bottom: '60px',
        right: '20px',
        zIndex: 900,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <div style={{
          background: '#0c66e4',
          padding: '4px 8px',
          borderRadius: '4px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>2026</div>
        <div style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>🐶</div>
      </div>
    </div>
  );
};
