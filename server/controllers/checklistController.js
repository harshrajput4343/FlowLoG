/**
 * Checklist Controller
 *
 * Fix BUG 10 — toggleChecklistItem replaced the read-then-write pattern
 * (which has a race condition) with a single atomic SQL UPDATE that flips
 * the boolean in-place. No stale read possible.
 */

const prisma = require('../prismaClient');
const { deleteCachePattern } = require('../utils/redisClient');

// ─── POST /api/checklists ─────────────────────────────────────────────────────
exports.createChecklist = async (req, res) => {
  const { title, cardId } = req.body;
  try {
    const checklist = await prisma.checklist.create({
      data: { title, cardId },
      include: { items: true }
    });
    await deleteCachePattern(`board:*:user:*`);
    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/checklists/:id ───────────────────────────────────────────────
exports.deleteChecklist = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.checklist.delete({ where: { id: parseInt(id) } });
    await deleteCachePattern(`board:*:user:*`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── POST /api/checklists/:id/items ──────────────────────────────────────────
exports.addChecklistItem = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const item = await prisma.checklistItem.create({
      data: { content, checklistId: parseInt(id) }
    });
    await deleteCachePattern(`board:*:user:*`);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PATCH /api/checklists/items/:id/toggle ───────────────────────────────────
exports.toggleChecklistItem = async (req, res) => {
  const { id } = req.params;
  const itemId = parseInt(id);
  try {
    // BUG 10 FIX — single atomic SQL statement; no read-modify-write race.
    // PostgreSQL NOT operator on boolean flips the value in-place.
    await prisma.$executeRaw`
      UPDATE "ChecklistItem"
      SET    "isChecked" = NOT "isChecked"
      WHERE  id = ${itemId}
    `;

    // Fetch the updated row to return it (one extra SELECT is fine — avoids
    // the race that existed in the old findUnique + update pattern).
    const updated = await prisma.checklistItem.findUnique({
      where: { id: itemId }
    });

    if (!updated) return res.status(404).json({ error: 'Item not found' });

    await deleteCachePattern(`board:*:user:*`);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── PUT /api/checklists/items/:id ───────────────────────────────────────────
exports.updateChecklistItem = async (req, res) => {
  const { id } = req.params;
  const { content, isChecked } = req.body;
  try {
    const item = await prisma.checklistItem.update({
      where: { id: parseInt(id) },
      data:  { content, isChecked }
    });
    await deleteCachePattern(`board:*:user:*`);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── DELETE /api/checklists/items/:id ────────────────────────────────────────
exports.deleteChecklistItem = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.checklistItem.delete({ where: { id: parseInt(id) } });
    await deleteCachePattern(`board:*:user:*`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
