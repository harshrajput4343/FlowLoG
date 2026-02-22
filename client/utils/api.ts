const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const apiClient = {
  // Boards
  getBoards: async (): Promise<any[]> => {
    // If not logged in and not guest, don't even try to fetch to avoid 401
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (!token) return [];
    }

    const res = await fetch(`${API_BASE}/boards`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch boards (${res.status})`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  getBoard: async (id: number) => {
    const res = await fetch(`${API_BASE}/boards/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch board');
    return res.json();
  },
  createBoard: async (title: string, background?: string) => {
    const res = await fetch(`${API_BASE}/boards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, background })
    });
    return res.json();
  },
  deleteBoard: async (id: number) => {
    await fetch(`${API_BASE}/boards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
  updateBoard: async (id: number, data: { title?: string; background?: string }) => {
    const res = await fetch(`${API_BASE}/boards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Lists
  createList: async (title: string, boardId: number) => {
    const res = await fetch(`${API_BASE}/lists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, boardId })
    });
    return res.json();
  },
  updateList: async (id: number, title: string) => {
    const res = await fetch(`${API_BASE}/lists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title })
    });
    return res.json();
  },
  updateListColor: async (id: number, color: string | null) => {
    const res = await fetch(`${API_BASE}/lists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ color })
    });
    return res.json();
  },
  deleteList: async (id: number) => {
    await fetch(`${API_BASE}/lists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
  reorderLists: async (items: { id: number, order: number }[], boardId: number) => {
    await fetch(`${API_BASE}/lists/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items, boardId })
    });
  },

  // Cards
  createCard: async (title: string, listId: number) => {
    const res = await fetch(`${API_BASE}/cards`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, listId })
    });
    return res.json();
  },
  updateCard: async (id: number, data: { title?: string; description?: string; dueDate?: string | null; listId?: number }) => {
    const res = await fetch(`${API_BASE}/cards/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteCard: async (id: number) => {
    await fetch(`${API_BASE}/cards/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
  reorderCards: async (items: { id: number, order: number, listId: number }[]) => {
    await fetch(`${API_BASE}/cards/reorder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ items })
    });
  },

  // Labels
  createLabel: async (name: string, color: string, boardId: number) => {
    const res = await fetch(`${API_BASE}/labels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, color, boardId })
    });
    return res.json();
  },
  deleteLabel: async (id: number) => {
    await fetch(`${API_BASE}/labels/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
  updateLabel: async (id: number, name: string, color: string) => {
    const res = await fetch(`${API_BASE}/labels/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, color })
    });
    return res.json();
  },
  addLabelToCard: async (cardId: number, labelId: number) => {
    const res = await fetch(`${API_BASE}/labels/card`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cardId, labelId })
    });
    return res.json();
  },
  removeLabelFromCard: async (cardId: number, labelId: number) => {
    await fetch(`${API_BASE}/labels/card/${cardId}/${labelId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Checklists
  createChecklist: async (title: string, cardId: number) => {
    const res = await fetch(`${API_BASE}/checklists`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, cardId })
    });
    return res.json();
  },
  deleteChecklist: async (id: number) => {
    await fetch(`${API_BASE}/checklists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
  addChecklistItem: async (checklistId: number, content: string) => {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return res.json();
  },
  toggleChecklistItem: async (itemId: number) => {
    const res = await fetch(`${API_BASE}/checklists/items/${itemId}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  },
  deleteChecklistItem: async (itemId: number) => {
    await fetch(`${API_BASE}/checklists/items/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Members
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/members/users`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },
  getBoardMembers: async (boardId: number) => {
    const res = await fetch(`${API_BASE}/members/board/${boardId}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },
  assignMemberToCard: async (cardId: number, userId: number) => {
    const res = await fetch(`${API_BASE}/members/card`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cardId, userId })
    });
    return res.json();
  },
  removeMemberFromCard: async (cardId: number, userId: number) => {
    await fetch(`${API_BASE}/members/card/${cardId}/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },
  createUser: async (name: string, email: string) => {
    const res = await fetch(`${API_BASE}/members/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
  }
};
