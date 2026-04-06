const prisma = require('../prismaClient');
const { deleteCachePattern } = require('../utils/redisClient');

exports.createList = async (req, res) => {
  const { title, boardId } = req.body;
  try {
    // Get current max order
    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' }
    });
    const order = lastList ? lastList.order + 1 : 0;

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        order
      }
    });
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reorderLists = async (req, res) => {
  // Expects { items: [{ id: 1, order: 0 }, { id: 2, order: 1 }] }
  const { items, boardId } = req.body;
  try {
    const transaction = items.map((item) =>
      prisma.list.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    );
    await prisma.$transaction(transaction);
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.status(200).json({ message: 'Lists reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteList = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.list.delete({ where: { id: parseInt(id) } });
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.updateList = async (req, res) => {
  const { id } = req.params;
  const { title, color } = req.body;
  try {
    const data = {};
    if (title !== undefined) data.title = title;
    if (color !== undefined) data.color = color;
    const list = await prisma.list.update({
      where: { id: parseInt(id) },
      data
    });
    // Invalidate board detail caches
    await deleteCachePattern(`board:*:user:*`);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
