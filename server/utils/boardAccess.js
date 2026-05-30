/**
 * Shared board-ownership / membership helper.
 *
 * These checks are used by board, list, and card controllers to ensure
 * callers can only mutate resources that belong to boards they own or are
 * members of.
 *
 * Fix BUG 5, 7, 8 — ownership verification propagated to card/list level.
 */

const prisma = require('../prismaClient');

/**
 * Returns true if userId owns or is a member of boardId.
 * @param {number} userId
 * @param {number} boardId
 * @returns {Promise<boolean>}
 */
async function userHasBoardAccess(userId, boardId) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      ownerId: true,
      members: { select: { userId: true } }
    }
  });

  if (!board) return false;
  if (board.ownerId === userId) return true;
  return board.members.some(m => m.userId === userId);
}

/**
 * Returns true if userId owns boardId (not just a member).
 * Used for destructive or privileged board-level operations.
 * @param {number} userId
 * @param {number} boardId
 * @returns {Promise<boolean>}
 */
async function userOwnsBoardId(userId, boardId) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { ownerId: true }
  });
  return board?.ownerId === userId;
}

/**
 * Resolves the boardId from a listId.
 * @param {number} listId
 * @returns {Promise<number|null>}
 */
async function getBoardIdFromList(listId) {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { boardId: true }
  });
  return list?.boardId ?? null;
}

/**
 * Resolves the boardId from a cardId.
 * @param {number} cardId
 * @returns {Promise<number|null>}
 */
async function getBoardIdFromCard(cardId) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { list: { select: { boardId: true } } }
  });
  return card?.list?.boardId ?? null;
}

module.exports = { userHasBoardAccess, userOwnsBoardId, getBoardIdFromList, getBoardIdFromCard };
