const prisma = require('../prismaClient');

exports.createCard = async (req, res) => {
  const { title, listId } = req.body;
  try {
    const lastCard = await prisma.card.findFirst({
      where: { listId },
      orderBy: { order: 'desc' }
    });
    const order = lastCard ? lastCard.order + 1 : 0;

    const card = await prisma.card.create({
      data: {
        title,
        listId,
        order
      }
    });
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCard = async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, listId, order } = req.body;
  // This endpoint handles detail updates. DnD might use reorder endpoint.
  // If listId is provided here, it moves the card.
  try {
    const card = await prisma.card.update({
      where: { id: parseInt(id) },
      data: { title, description, dueDate, listId, order }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reorderCards = async (req, res) => {
  // Handle both reorder within list and move between lists
  // Expects: { items: [{ id, order, listId }] }
  // OR simpler: batch update logic. 
  // If moving between lists, `listId` update is needed.
  const { items } = req.body;
  try {
    const transaction = items.map((item) =>
      prisma.card.update({
        where: { id: item.id },
        data: { order: item.order, listId: item.listId }
      })
    );
    await prisma.$transaction(transaction);
    res.status(200).json({ message: 'Cards reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.deleteCard = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.card.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
