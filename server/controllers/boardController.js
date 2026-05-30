/**
 * Board Controller
 *
 * Fixes:
 *   BUG 3 — createBoard no longer falls back to ownerId=1 for guests;
 *            req.userId is guaranteed by requireAuth at the route layer.
 *   P1    — getBoardById uses select field pruning instead of fetching
 *            every column on every nested row.
 */

const prisma = require('../prismaClient');
const { getCache, setCache, deleteCache, deleteCachePattern } = require('../utils/redisClient');
const { userHasBoardAccess } = require('../utils/boardAccess');

// ─── GET /api/boards ──────────────────────────────────────────────────────────
exports.getBoards = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) return res.json([]);

    const cacheKey = `boards:user:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      select: {
        id: true, title: true, background: true, ownerId: true, createdAt: true,
        lists: { select: { id: true } },
        members: {
          select: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformed = boards.map(b => ({
      ...b,
      members: b.members.map(m => m.user)
    }));

    await setCache(cacheKey, transformed, 60);
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET /api/boards/:id ──────────────────────────────────────────────────────
exports.getBoardById = async (req, res) => {
  const { id } = req.params;
  try {
    const userId   = req.userId;
    const boardId  = parseInt(id);

    const cacheKey = `board:${boardId}:user:${userId}`;
    const cached   = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true, title: true, background: true, ownerId: true, createdAt: true, updatedAt: true,
        members: {
          select: { userId: true, user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
        },
        labels: { select: { id: true, name: true, color: true } },
        lists: {
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, order: true, boardId: true, color: true,
            cards: {
              orderBy: { order: 'asc' },
              select: {
                id: true, title: true, description: true, order: true, dueDate: true, listId: true,
                labels: {
                  select: { label: { select: { id: true, name: true, color: true } } }
                },
                members: {
                  select: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
                },
                checklists: {
                  select: {
                    id: true, title: true,
                    items: { select: { id: true, content: true, isChecked: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!board) return res.status(404).json({ error: 'Board not found' });

    // Access check — owner or member
    const isMember = board.members.some(m => m.userId === userId);
    if (board.ownerId !== userId && !isMember) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    const transformed = {
      ...board,
      members: board.members.map(m => m.user),
      lists: board.lists.map(list => ({
        ...list,
        cards: list.cards.map(card => ({
          ...card,
          labels:     card.labels.map(cl => cl.label),
          members:    card.members.map(cm => cm.user),
          checklists: card.checklists
        }))
      }))
    };

    await setCache(cacheKey, transformed, 30);
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/boards ─────────────────────────────────────────────────────────
exports.createBoard = async (req, res) => {
  const { title, background } = req.body;
  try {
    // BUG 3 FIX: req.userId is guaranteed by requireAuth middleware —
    // no more "|| ownerId || 1" fallback that let guests create boards for user 1.
    const ownerId = req.userId;

    const newBoard = await prisma.board.create({
      data: {
        title,
        background: background || '#0079bf',
        ownerId
      }
    });

    // Create default labels
    await prisma.label.createMany({
      data: [
        { name: 'Urgent',    color: '#eb5a46', boardId: newBoard.id },
        { name: 'Required',  color: '#f2d600', boardId: newBoard.id },
        { name: 'Not Urgent',color: '#61bd4f', boardId: newBoard.id }
      ]
    });

    await deleteCache(`boards:user:${ownerId}`);
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/boards/:id ───────────────────────────────────────────────────
exports.deleteBoard = async (req, res) => {
  const { id } = req.params;
  try {
    const userId  = req.userId;
    const boardId = parseInt(id);

    const board = await prisma.board.findUnique({ where: { id: boardId }, select: { ownerId: true } });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    if (board.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the board owner can delete this board' });
    }

    await prisma.board.delete({ where: { id: boardId } });

    await deleteCachePattern(`board:${boardId}:user:*`);
    await deleteCachePattern(`boards:user:*`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PUT /api/boards/:id ──────────────────────────────────────────────────────
exports.updateBoard = async (req, res) => {
  const { id } = req.params;
  const { title, background } = req.body;
  try {
    const userId  = req.userId;
    const boardId = parseInt(id);

    // BUG 2 / BUG 9 partial — block non-premium users from saving image backgrounds
    // (The client also validates this, but server is the real gate.)
    if (background && background.startsWith('url(') && !req.isPremium) {
      return res.status(403).json({ error: 'Image backgrounds require a Pro subscription' });
    }

    const board = await prisma.board.findUnique({ where: { id: boardId }, select: { ownerId: true } });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    if (board.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the board owner can update this board' });
    }

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data:  { title, background }
    });

    await deleteCachePattern(`board:${boardId}:user:*`);
    await deleteCachePattern(`boards:user:*`);
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/boards/:id/share ──────────────────────────────────────────────
exports.generateShareToken = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.userId;
    const boardId = parseInt(id);

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { ownerId: true, members: { select: { userId: true } } }
    });

    if (!board) return res.status(404).json({ error: 'Board not found' });

    const isMember = board.members.some(m => m.userId === userId);
    if (board.ownerId !== userId && !isMember) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(16).toString('hex');

    await prisma.board.update({
      where: { id: boardId },
      data: { shareToken: token }
    });

    res.json({ shareToken: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET /api/boards/share/:token ─────────────────────────────────────────────
exports.getBoardByShareToken = async (req, res) => {
  const { token } = req.params;
  try {
    if (!token) {
      return res.status(400).json({ error: 'Share token is required' });
    }

    const board = await prisma.board.findUnique({
      where: { shareToken: token },
      select: {
        id: true, title: true, background: true, ownerId: true, createdAt: true, updatedAt: true,
        members: {
          select: { userId: true, user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
        },
        labels: { select: { id: true, name: true, color: true } },
        lists: {
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, order: true, boardId: true, color: true,
            cards: {
              orderBy: { order: 'asc' },
              select: {
                id: true, title: true, description: true, order: true, dueDate: true, listId: true,
                labels: {
                  select: { label: { select: { id: true, name: true, color: true } } }
                },
                members: {
                  select: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
                },
                checklists: {
                  select: {
                    id: true, title: true,
                    items: { select: { id: true, content: true, isChecked: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!board) return res.status(404).json({ error: 'Board not found' });

    const transformed = {
      ...board,
      members: board.members.map(m => m.user),
      lists: board.lists.map(list => ({
        ...list,
        cards: list.cards.map(card => ({
          ...card,
          labels:     card.labels.map(cl => cl.label),
          members:    card.members.map(cm => cm.user),
          checklists: card.checklists
        }))
      }))
    };

    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

