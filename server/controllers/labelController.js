const prisma = require('../prismaClient');

exports.createLabel = async (req, res) => {
  const { name, color, boardId } = req.body;
  try {
    const label = await prisma.label.create({
      data: { name, color, boardId }
    });
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
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLabel = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.label.delete({ where: { id: parseInt(id) } });
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
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
