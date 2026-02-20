'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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

const BG_COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632', '#89609e',
  '#cd5a91', '#4bbf6b', '#00aecc', '#838c91', '#172b4d',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

// Dynamic Current Date widget
const LiveDate = () => {
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      right: '20px',
      zIndex: 900,
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.15)',
        padding: '5px 12px',
        borderRadius: '20px',
        color: 'white',
        fontWeight: '600',
        fontSize: '12px',
        letterSpacing: '0.3px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        whiteSpace: 'nowrap',
      }}>{dateStr}</div>
    </div>
  );
};

export const BoardCanvas = ({ board: initialBoard }: Props) => {
  const router = useRouter();
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

  // Board dot-menu state
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [showBgPanel, setShowBgPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const boardMenuRef = useRef<HTMLDivElement>(null);

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

  // Close board menu / bg panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boardMenuRef.current && !boardMenuRef.current.contains(e.target as Node)) {
        setShowBoardMenu(false);
        setShowBgPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleUpdateListColor = async (listId: number, color: string | null) => {
    await apiClient.updateListColor(listId, color);
    const updatedLists = board.lists.map(list => {
      if (list.id === listId) {
        return { ...list, color: color || undefined };
      }
      return list;
    });
    setBoard({ ...board, lists: updatedLists });
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

  // Delete board handler
  const handleDeleteBoard = async () => {
    try {
      await apiClient.deleteBoard(board.id);
      // Remove from recent boards
      const recent = JSON.parse(localStorage.getItem('recentBoards') || '[]');
      localStorage.setItem('recentBoards', JSON.stringify(recent.filter((b: { id: number }) => b.id !== board.id)));
      router.push('/');
    } catch (err) {
      console.error('Failed to delete board:', err);
    }
  };

  // Change background handler
  const handleChangeBg = async (bg: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api'}/boards/${board.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ background: bg }),
      });
      setBoard({ ...board, background: bg });
    } catch (err) {
      console.error('Failed to update background:', err);
    }
  };

  const filterCards = useCallback((cards: Card[]) => {
    return cards.filter(card => {
      if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterLabel && !card.labels.some(l => l.id === filterLabel)) {
        return false;
      }
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

                  {/* 3-dot Board Menu */}
                  <div ref={boardMenuRef} style={{ position: 'relative' }}>
                    <button
                      className={`${styles.moreBtn} ${showBoardMenu ? styles.moreBtnActive : ''}`}
                      onClick={() => {
                        setShowBoardMenu(prev => !prev);
                        setShowBgPanel(false);
                      }}
                      title="Board menu"
                    >
                      ⋯
                    </button>

                    {showBoardMenu && !showBgPanel && (
                      <div className={styles.boardMenu}>
                        <div className={styles.boardMenuHeader}>Board actions</div>
                        <button
                          className={styles.boardMenuItem}
                          onClick={() => {
                            setShowBgPanel(true);
                          }}
                        >
                          <span className={styles.boardMenuIcon}>🎨</span>
                          Change Background
                        </button>
                        <div className={styles.boardMenuDivider} />
                        <button
                          className={`${styles.boardMenuItem} ${styles.boardMenuDanger}`}
                          onClick={() => {
                            setShowBoardMenu(false);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <span className={styles.boardMenuIcon}>🗑️</span>
                          Delete Board
                        </button>
                      </div>
                    )}

                    {/* Background Picker Panel */}
                    {showBgPanel && (
                      <div className={styles.bgPanel}>
                        <div className={styles.bgPanelHeader}>
                          <button
                            className={styles.bgPanelBack}
                            onClick={() => setShowBgPanel(false)}
                          >
                            ← Back
                          </button>
                          <span>Change Background</span>
                        </div>

                        <div className={styles.bgSection}>
                          <div className={styles.bgSectionTitle}>Colors & Gradients</div>
                          <div className={styles.bgColorGrid}>
                            {BG_COLORS.map((bg, i) => (
                              <button
                                key={i}
                                className={`${styles.bgColorSwatch} ${board.background === bg ? styles.bgColorSelected : ''}`}
                                style={{ background: bg }}
                                onClick={() => {
                                  handleChangeBg(bg);
                                  setShowBgPanel(false);
                                  setShowBoardMenu(false);
                                }}
                                title={bg}
                              />
                            ))}
                          </div>
                        </div>

                        <div className={styles.bgSection}>
                          <div className={styles.bgSectionTitle}>Custom Image URL</div>
                          <div className={styles.bgImageRow}>
                            <input
                              type="text"
                              placeholder="Paste image URL..."
                              className={styles.bgImageInput}
                              id="bg-image-url"
                            />
                            <button
                              className={styles.bgImageApplyBtn}
                              onClick={() => {
                                const url = (document.getElementById('bg-image-url') as HTMLInputElement)?.value?.trim();
                                if (url) {
                                  handleChangeBg(`url(${url})`);
                                  setShowBgPanel(false);
                                  setShowBoardMenu(false);
                                }
                              }}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
                    onUpdateListColor={handleUpdateListColor}
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

      {/* Bottom Navigation — Board & Switch Boards only */}
      <nav className={styles.bottomNav}>
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

      {/* Delete Board Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h3 className={styles.confirmTitle}>Delete Board?</h3>
            <p className={styles.confirmText}>
              Are you sure you want to delete <strong>"{board.title}"</strong>? All lists and cards will be permanently removed. This action cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmDeleteBtn}
                onClick={handleDeleteBoard}
              >
                Delete Board
              </button>
              <button
                className={styles.confirmCancelBtn}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Date Widget */}
      <LiveDate />
    </div>
  );
};
