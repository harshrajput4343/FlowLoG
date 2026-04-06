const prisma = require('../prismaClient');
const { deleteCachePattern } = require('../utils/redisClient');

exports.createLabel = async (req, res) => {
  const { name, color, boardId } = req.body;
  try {
    const label = await prisma.label.create({
      data: { name, color, boardId }
    });
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.status(201).json(label);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateLabel = async (req, res) => {
  const { id } = req.params;
  const { name, color } = req.body;
  try {
    const label = await prisma.label.update({
      where: { id: parseInt(id) },
      data: { name, color }
    });
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLabel = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.label.delete({ where: { id: parseInt(id) } });
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addLabelToCard = async (req, res) => {
  const { cardId, labelId } = req.body;
  try {
    const cardLabel = await prisma.cardLabel.create({
      data: { cardId, labelId },
      include: { label: true }
    });
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.status(201).json(cardLabel.label);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Label already on card' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.removeLabelFromCard = async (req, res) => {
  const { cardId, labelId } = req.params;
  try {
    await prisma.cardLabel.delete({
      where: {
        cardId_labelId: {
          cardId: parseInt(cardId),
          labelId: parseInt(labelId)
        }
      }
    });
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
