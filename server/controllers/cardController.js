/**
 * Card Controller
 *
 * Fixes:
 *   BUG 5  — createCard, updateCard, deleteCard now verify the caller
 *             owns or is a member of the board containing the card/list
 *   BUG 8  — updateCard validates that a requested listId move stays within
 *             the same board; cross-board card moves are rejected
 *   P3     — reorderCards uses a single bulk UPDATE instead of N queries
 */

const prisma = require('../prismaClient');
const { deleteCachePattern } = require('../utils/redisClient');
const { userHasBoardAccess, getBoardIdFromList, getBoardIdFromCard } = require('../utils/boardAccess');

// ─── POST /api/cards ──────────────────────────────────────────────────────────
exports.createCard = async (req, res) => {
  const { title, listId } = req.body;
  try {
    const userId  = req.userId;
    const boardId = await getBoardIdFromList(listId);

    if (!boardId) return res.status(404).json({ error: 'List not found' });

    // BUG 5 — verify access before creating
    const hasAccess = await userHasBoardAccess(userId, boardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    const lastCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });
    const order = lastCard ? lastCard.order + 1 : 0;

    const card = await prisma.card.create({ data: { title, listId, order } });
    await deleteCachePattern(`board:${boardId}:user:*`);
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PUT /api/cards/:id ───────────────────────────────────────────────────────
exports.updateCard = async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, listId, order } = req.body;
  try {
    const userId = req.userId;
    const cardId = parseInt(id);

    // BUG 5 — find the board the card currently belongs to
    const currentBoardId = await getBoardIdFromCard(cardId);
    if (!currentBoardId) return res.status(404).json({ error: 'Card not found' });

    const hasAccess = await userHasBoardAccess(userId, currentBoardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    // BUG 8 — if the caller is trying to move the card to a different list,
    // verify the target list belongs to the SAME board
    if (listId !== undefined) {
      const targetBoardId = await getBoardIdFromList(listId);
      if (targetBoardId !== currentBoardId) {
        return res.status(403).json({ error: 'Cards cannot be moved across boards' });
      }
    }

    const data = {};
    if (title       !== undefined) data.title       = title;
    if (description !== undefined) data.description = description;
    if (dueDate     !== undefined) data.dueDate      = dueDate;
    if (listId      !== undefined) data.listId       = listId;
    if (order       !== undefined) data.order        = order;

    const card = await prisma.card.update({ where: { id: cardId }, data });
    await deleteCachePattern(`board:${currentBoardId}:user:*`);
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PUT /api/cards/reorder ───────────────────────────────────────────────────
exports.reorderCards = async (req, res) => {
  const { items } = req.body;
  try {
    const userId = req.userId;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    // BUG 5 — resolve the board from the first card and verify access
    const firstCardBoardId = await getBoardIdFromCard(items[0].id);
    if (!firstCardBoardId) return res.status(404).json({ error: 'Card not found' });

    const hasAccess = await userHasBoardAccess(userId, firstCardBoardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    // BUG 8 — ensure all target listIds belong to the same board
    const targetListIds = [...new Set(items.map(i => i.listId).filter(Boolean))];
    if (targetListIds.length > 0) {
      const lists = await prisma.list.findMany({
        where: { id: { in: targetListIds } },
        select: { id: true, boardId: true }
      });
      const crossBoard = lists.some(l => l.boardId !== firstCardBoardId);
      if (crossBoard) {
        return res.status(403).json({ error: 'Cards cannot be moved across boards' });
      }
    }

    // P3 — single bulk UPDATE with CASE WHEN for order
    const orderCases  = items.map(i => `WHEN ${i.id} THEN ${i.order}`).join(' ');
    const listIdCases = items
      .filter(i => i.listId !== undefined)
      .map(i => `WHEN ${i.id} THEN ${i.listId}`)
      .join(' ');
    const ids = items.map(i => i.id).join(', ');

    if (listIdCases) {
      await prisma.$executeRawUnsafe(
        `UPDATE "Card"
         SET "order"  = CASE id ${orderCases}  END,
             "listId" = CASE id ${listIdCases} END
         WHERE id IN (${ids})`
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE "Card" SET "order" = CASE id ${orderCases} END WHERE id IN (${ids})`
      );
    }

    await deleteCachePattern(`board:${firstCardBoardId}:user:*`);
    res.status(200).json({ message: 'Cards reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/cards/:id ────────────────────────────────────────────────────
exports.deleteCard = async (req, res) => {
  const { id } = req.params;
  try {
    const userId  = req.userId;
    const cardId  = parseInt(id);
    const boardId = await getBoardIdFromCard(cardId);

    if (!boardId) return res.status(404).json({ error: 'Card not found' });

    // BUG 5 — ownership check before deleting
    const hasAccess = await userHasBoardAccess(userId, boardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }

    await prisma.card.delete({ where: { id: cardId } });
    await deleteCachePattern(`board:${boardId}:user:*`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
