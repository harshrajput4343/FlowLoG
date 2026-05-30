/**
 * Checklist routes — all mutations require authentication.
 * Fix BUG 3 — guests can no longer create/toggle/delete checklist items.
 * Note: specific paths (/items/:id/toggle, /items/:id) are before /:id.
 */

const express               = require('express');
const router                = express.Router();
const checklistController   = require('../controllers/checklistController');
const authMiddleware        = require('../middleware/auth');
const requireAuth           = require('../middleware/requireAuth');

router.post('/',                         authMiddleware, requireAuth, checklistController.createChecklist);
router.delete('/:id',                    authMiddleware, requireAuth, checklistController.deleteChecklist);
router.post('/:id/items',               authMiddleware, requireAuth, checklistController.addChecklistItem);
router.put('/items/:id',                 authMiddleware, requireAuth, checklistController.updateChecklistItem);
router.patch('/items/:id/toggle',        authMiddleware, requireAuth, checklistController.toggleChecklistItem);
router.delete('/items/:id',              authMiddleware, requireAuth, checklistController.deleteChecklistItem);

module.exports = router;
