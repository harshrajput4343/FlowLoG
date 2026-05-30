/**
 * Member Controller
 *
 * Fix P2 — getUsers now has a hard limit of 200 rows and only selects the
 *           columns the client actually needs (id, name, email, avatarUrl).
 *           Previously `prisma.user.findMany()` fetched the entire user table
 *           with all columns on every card detail open.
 */

const prisma = require('../prismaClient');
const { getCache, setCache, deleteCache, deleteCachePattern } = require('../utils/redisClient');

// ─── GET /api/members/board/:boardId ─────────────────────────────────────────
exports.getBoardMembers = async (req, res) => {
  const { boardId } = req.params;
  try {
    const cacheKey = `board:${boardId}:members`;
    const cached   = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const members = await prisma.boardMember.findMany({
      where:   { boardId: parseInt(boardId) },
      select:  { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
    });

    const result = members.map(m => m.user);
    await setCache(cacheKey, result, 300);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/members/card ───────────────────────────────────────────────────
exports.assignMemberToCard = async (req, res) => {
  const { cardId, userId } = req.body;
  try {
    const cardMember = await prisma.cardMember.create({
      data:    { cardId, userId },
      include: { user: true }
    });
    await deleteCachePattern('board:*:user:*');
    res.status(201).json(cardMember.user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Member already assigned' });
    }
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/members/card/:cardId/:userId ─────────────────────────────────
exports.removeMemberFromCard = async (req, res) => {
  const { cardId, userId } = req.params;
  try {
    await prisma.cardMember.delete({
      where: {
        cardId_userId: {
          cardId: parseInt(cardId),
          userId: parseInt(userId)
        }
      }
    });
    await deleteCachePattern('board:*:user:*');
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── GET /api/members/users ───────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const cacheKey = 'users:all';
    const cached   = await getCache(cacheKey);
    if (cached) return res.json(cached);

    // P2 FIX — limit to 200, select only required columns, skip passwordHash
    const users = await prisma.user.findMany({
      take:    200,
      orderBy: { name: 'asc' },
      select:  { id: true, name: true, email: true, avatarUrl: true }
    });

    await setCache(cacheKey, users, 600);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/members/users ──────────────────────────────────────────────────
exports.createUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const user = await prisma.user.create({
      data:   { name, email },
      select: { id: true, name: true, email: true, avatarUrl: true }
    });
    await deleteCache('users:all');
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/members/users/:id ───────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    await deleteCache('users:all');
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
