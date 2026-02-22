const prisma = require('../prismaClient');

exports.getBoards = async (req, res) => {
  try {
    const userId = req.userId;

    // Build where clause — if user is authenticated, show only their boards
    const whereClause = userId ? { ownerId: userId } : {};

    const boards = await prisma.board.findMany({
      where: whereClause,
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
    res.json(transformedBoards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoardById = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.userId;

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

    // Verify ownership — only the owner or a guest (demo) can access
    if (userId && board.ownerId !== userId) {
      return res.status(403).json({ error: 'You do not have access to this board' });
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
    res.json(updatedBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
