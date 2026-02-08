const API_BASE = 'http://localhost:3001/api';

export const apiClient = {
  // Boards
  getBoards: async () => {
    const res = await fetch(`${API_BASE}/boards`);
    return res.json();
  },
  getBoard: async (id: number) => {
    const res = await fetch(`${API_BASE}/boards/${id}`);
    if (!res.ok) throw new Error('Failed to fetch board');
    return res.json();
  },
  createBoard: async (title: string, background?: string) => {
    const res = await fetch(`${API_BASE}/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, background })
    });
    return res.json();
  },
  deleteBoard: async (id: number) => {
    await fetch(`${API_BASE}/boards/${id}`, { method: 'DELETE' });
  },

  // Lists
  createList: async (title: string, boardId: number) => {
    const res = await fetch(`${API_BASE}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, boardId })
    });
    return res.json();
  },
  updateList: async (id: number, title: string) => {
    const res = await fetch(`${API_BASE}/lists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return res.json();
  },
  deleteList: async (id: number) => {
    await fetch(`${API_BASE}/lists/${id}`, { method: 'DELETE' });
  },
  reorderLists: async (items: { id: number, order: number }[], boardId: number) => {
    await fetch(`${API_BASE}/lists/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, boardId })
    });
  },

  // Cards
  createCard: async (title: string, listId: number) => {
    const res = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, listId })
    });
    return res.json();
  },
  updateCard: async (id: number, data: { title?: string; description?: string; dueDate?: string | null; listId?: number }) => {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteCard: async (id: number) => {
    await fetch(`${API_BASE}/cards/${id}`, { method: 'DELETE' });
  },
  reorderCards: async (items: { id: number, order: number, listId: number }[]) => {
    await fetch(`${API_BASE}/cards/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
  },

  // Labels
  createLabel: async (name: string, color: string, boardId: number) => {
    const res = await fetch(`${API_BASE}/labels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color, boardId })
    });
    return res.json();
  },
  deleteLabel: async (id: number) => {
    await fetch(`${API_BASE}/labels/${id}`, { method: 'DELETE' });
  },
  addLabelToCard: async (cardId: number, labelId: number) => {
    const res = await fetch(`${API_BASE}/labels/card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, labelId })
    });
    return res.json();
  },
  removeLabelFromCard: async (cardId: number, labelId: number) => {
    await fetch(`${API_BASE}/labels/card/${cardId}/${labelId}`, { method: 'DELETE' });
  },

  // Checklists
  createChecklist: async (title: string, cardId: number) => {
    const res = await fetch(`${API_BASE}/checklists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, cardId })
    });
    return res.json();
  },
  deleteChecklist: async (id: number) => {
    await fetch(`${API_BASE}/checklists/${id}`, { method: 'DELETE' });
  },
  addChecklistItem: async (checklistId: number, content: string) => {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return res.json();
  },
  toggleChecklistItem: async (itemId: number) => {
    const res = await fetch(`${API_BASE}/checklists/items/${itemId}/toggle`, {
      method: 'PATCH'
    });
    return res.json();
  },
  deleteChecklistItem: async (itemId: number) => {
    await fetch(`${API_BASE}/checklists/items/${itemId}`, { method: 'DELETE' });
  },

  // Members
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/members/users`);
    return res.json();
  },
  getBoardMembers: async (boardId: number) => {
    const res = await fetch(`${API_BASE}/members/board/${boardId}`);
    return res.json();
  },
  assignMemberToCard: async (cardId: number, userId: number) => {
    const res = await fetch(`${API_BASE}/members/card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, userId })
    });
    return res.json();
  },
  removeMemberFromCard: async (cardId: number, userId: number) => {
    await fetch(`${API_BASE}/members/card/${cardId}/${userId}`, { method: 'DELETE' });
  }
};
