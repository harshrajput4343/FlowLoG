const prisma = require('../prismaClient');

exports.createChecklist = async (req, res) => {
  const { title, cardId } = req.body;
  try {
    const checklist = await prisma.checklist.create({
      data: { title, cardId },
      include: { items: true }
    });
    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteChecklist = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.checklist.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addChecklistItem = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const item = await prisma.checklistItem.create({
      data: {
        content,
        checklistId: parseInt(id)
      }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleChecklistItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await prisma.checklistItem.findUnique({
      where: { id: parseInt(id) }
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const updated = await prisma.checklistItem.update({
      where: { id: parseInt(id) },
      data: { isChecked: !item.isChecked }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateChecklistItem = async (req, res) => {
  const { id } = req.params;
  const { content, isChecked } = req.body;
  try {
    const item = await prisma.checklistItem.update({
      where: { id: parseInt(id) },
      data: { content, isChecked }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteChecklistItem = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.checklistItem.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
