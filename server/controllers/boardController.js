const prisma = require('../prismaClient');
const { getCache, setCache, deleteCache } = require('../utils/redisClient');

exports.getBoards = async (req, res) => {
  try {
    const userId = req.userId;

    // Guests cannot list boards
    if (!userId) {
      return res.json([]);
    }

    // Try cache first — always user-specific
    const cacheKey = `boards:user:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Only show boards owned by or shared with this user
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId: userId } } }
        ]
      },
      include: {
        lists: true,
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    // Transform to flatten members
    const transformedBoards = boards.map(board => ({
      ...board,
      members: board.members.map(m => m.user)
    }));

    // Cache for 60 seconds
    await setCache(cacheKey, transformedBoards, 60);

    res.json(transformedBoards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoardById = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.userId;

    // Try cache first — user-specific cache key
    const cacheKey = `board:${id}:user:${userId || 'guest'}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const board = await prisma.board.findUnique({
      where: { id: parseInt(id) },
      include: {
        lists: {
          include: {
            cards: {
              include: {
                labels: {
                  include: { label: true }
                },
                members: {
                  include: { user: true }
                },
                checklists: {
                  include: { items: true }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        members: {
          include: { user: true }
        },
        labels: true
      }
    });
    if (!board) return res.status(404).json({ error: 'Board not found' });

    // Verify ownership or membership
    if (userId) {
      const isMember = board.members.some(m => m.userId === userId);
      if (board.ownerId !== userId && !isMember) {
        return res.status(403).json({ error: 'You do not have access to this board' });
      }
    } else {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Transform to flatten join tables
    const transformedBoard = {
      ...board,
      members: board.members.map(m => m.user),
      lists: board.lists.map(list => ({
        ...list,
        cards: list.cards.map(card => ({
          ...card,
          labels: card.labels.map(cl => cl.label),
          members: card.members.map(cm => cm.user),
          checklists: card.checklists.map(checklist => ({
            ...checklist,
            items: checklist.items
          }))
        }))
      }))
    };

    // Cache for 30 seconds
    await setCache(cacheKey, transformedBoard, 30);

    res.json(transformedBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createBoard = async (req, res) => {
  const { title, background, ownerId } = req.body;
  try {
    // Use authenticated user's ID, fall back to provided ownerId, then default to 1
    const resolvedOwnerId = req.userId || ownerId || 1;

    const newBoard = await prisma.board.create({
      data: {
        title,
        background: background || '#0079bf',
        ownerId: resolvedOwnerId
      }
    });

    // Create predefined labels for the new board
    await prisma.label.createMany({
      data: [
        { name: 'Urgent', color: '#eb5a46', boardId: newBoard.id },
        { name: 'Required', color: '#f2d600', boardId: newBoard.id },
        { name: 'Not Urgent', color: '#61bd4f', boardId: newBoard.id },
      ]
    });

    // Invalidate boards list cache
    await deleteCache(`boards:user:${resolvedOwnerId}`);

    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBoard = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.userId;

    // Verify ownership before deleting
    if (userId) {
      const board = await prisma.board.findUnique({ where: { id: parseInt(id) } });
      if (!board) return res.status(404).json({ error: 'Board not found' });
      if (board.ownerId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own boards' });
      }
    }

    await prisma.board.delete({
      where: { id: parseInt(id) }
    });

    // Invalidate caches
    await deleteCache(`board:${id}:user:${userId}`);
    if (userId) await deleteCache(`boards:user:${userId}`);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  const { id } = req.params;
  const { title, background } = req.body;
  try {
    const userId = req.userId;

    // Verify ownership before updating
    if (userId) {
      const board = await prisma.board.findUnique({ where: { id: parseInt(id) } });
      if (!board) return res.status(404).json({ error: 'Board not found' });
      if (board.ownerId !== userId) {
        return res.status(403).json({ error: 'You can only update your own boards' });
      }
    }

    const updatedBoard = await prisma.board.update({
      where: { id: parseInt(id) },
      data: { title, background }
    });

    // Invalidate caches
    await deleteCache(`board:${id}:user:${userId}`);
    if (userId) await deleteCache(`boards:user:${userId}`);

    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
