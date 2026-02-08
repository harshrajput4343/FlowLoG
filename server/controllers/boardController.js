const prisma = require('../prismaClient');

exports.getBoards = async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
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
    const newBoard = await prisma.board.create({
      data: {
        title,
        background: background || '#0079bf',
        ownerId: ownerId || 1 // Default to user 1 if not provided
      }
    });
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBoard = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.board.delete({
      where: { id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
