const prisma = require('../prismaClient');
const { getCache, setCache, deleteCache, deleteCachePattern } = require('../utils/redisClient');

exports.getBoardMembers = async (req, res) => {
  const { boardId } = req.params;
  try {
    const cacheKey = `board:${boardId}:members`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const members = await prisma.boardMember.findMany({
      where: { boardId: parseInt(boardId) },
      include: { user: true }
    });
    const result = members.map(m => m.user);
    await setCache(cacheKey, result, 300); // 5 min
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignMemberToCard = async (req, res) => {
  const { cardId, userId } = req.body;
  try {
    const cardMember = await prisma.cardMember.create({
      data: { cardId, userId },
      include: { user: true }
    });
    // Invalidate board detail cache as it includes card members
    // We don't have boardId here directly, but we can pattern match
    await deleteCachePattern('board:*:user:*');
    res.status(201).json(cardMember.user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Member already assigned' });
    }
    res.status(500).json({ error: error.message });
  }
};

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
    // Invalidate board detail cache
    await deleteCachePattern('board:*:user:*');
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const cacheKey = 'users:all';
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const users = await prisma.user.findMany();
    await setCache(cacheKey, users, 600); // 10 min
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    const user = await prisma.user.create({
      data: { name, email }
    });
    // Invalidate users list
    await deleteCache('users:all');
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    // Invalidate users list
    await deleteCache('users:all');
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
