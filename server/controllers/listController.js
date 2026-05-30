/**
 * List Controller
 *
 * Fixes:
 *   BUG 5 — updateList, deleteList now verify caller owns/is-member of the board
 *   BUG 7 — reorderLists verifies boardId ownership AND that every listId
 *            in the payload actually belongs to that board
 *   P3    — reorderLists uses a single bulk UPDATE instead of N individual queries
 */

const prisma = require('../prismaClient');
const { deleteCachePattern } = require('../utils/redisClient');
const { userHasBoardAccess, userOwnsBoardId, getBoardIdFromList } = require('../utils/boardAccess');

// ─── POST /api/lists ──────────────────────────────────────────────────────────
exports.createList = async (req, res) => {
  const { title, boardId } = req.body;
  try {
    const userId = req.userId;

    // BUG 5 — verify caller has access to this board
    const hasAccess = await userHasBoardAccess(userId, boardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    const order = lastList ? lastList.order + 1 : 0;

    const list = await prisma.list.create({ data: { title, boardId, order } });
    await deleteCachePattern(`board:${boardId}:user:*`);
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PUT /api/lists/reorder ───────────────────────────────────────────────────
exports.reorderLists = async (req, res) => {
  const { items, boardId } = req.body;
  try {
    const userId = req.userId;

    if (!boardId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'boardId and items array are required' });
    }

    // BUG 7 — verify caller has access to the board
    const hasAccess = await userHasBoardAccess(userId, boardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    // BUG 7 — verify every listId in the payload belongs to this board
    const lists = await prisma.list.findMany({
      where: { id: { in: items.map(i => i.id) } },
      select: { id: true, boardId: true }
    });

    const allBelongToBoard = lists.every(l => l.boardId === boardId);
    if (lists.length !== items.length || !allBelongToBoard) {
      return res.status(403).json({ error: 'One or more list IDs do not belong to this board' });
    }

    // P3 — single bulk UPDATE using CASE WHEN instead of N individual queries
    const cases = items.map(item => `WHEN ${item.id} THEN ${item.order}`).join(' ');
    const ids   = items.map(item => item.id).join(', ');
    await prisma.$executeRawUnsafe(
      `UPDATE "List" SET "order" = CASE id ${cases} END WHERE id IN (${ids})`
    );

    await deleteCachePattern(`board:${boardId}:user:*`);
    res.status(200).json({ message: 'Lists reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/lists/:id ────────────────────────────────────────────────────
exports.deleteList = async (req, res) => {
  const { id } = req.params;
  try {
    const userId  = req.userId;
    const listId  = parseInt(id);
    const boardId = await getBoardIdFromList(listId);

    if (!boardId) return res.status(404).json({ error: 'List not found' });

    // BUG 5 — ownership check
    const hasAccess = await userHasBoardAccess(userId, boardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    await prisma.list.delete({ where: { id: listId } });
    await deleteCachePattern(`board:${boardId}:user:*`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PUT /api/lists/:id ───────────────────────────────────────────────────────
exports.updateList = async (req, res) => {
  const { id } = req.params;
  const { title, color } = req.body;
  try {
    const userId  = req.userId;
    const listId  = parseInt(id);
    const boardId = await getBoardIdFromList(listId);

    if (!boardId) return res.status(404).json({ error: 'List not found' });

    // BUG 5 — ownership check
    const hasAccess = await userHasBoardAccess(userId, boardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (color !== undefined) data.color = color;

    const list = await prisma.list.update({ where: { id: listId }, data });
    await deleteCachePattern(`board:${boardId}:user:*`);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
