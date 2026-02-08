const prisma = require('../prismaClient');

exports.getBoardMembers = async (req, res) => {
  const { boardId } = req.params;
  try {
    const members = await prisma.boardMember.findMany({
      where: { boardId: parseInt(boardId) },
      include: { user: true }
    });
    res.json(members.map(m => m.user));
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
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
