/**
 * Card routes — all mutations require authentication.
 * Fix BUG 3 — guests can no longer create/update/delete cards.
 * Note: /reorder is declared before /:id to avoid route shadowing.
 */

const express         = require('express');
const router          = express.Router();
const cardController  = require('../controllers/cardController');
const authMiddleware  = require('../middleware/auth');
const requireAuth     = require('../middleware/requireAuth');

router.post('/',         authMiddleware, requireAuth, cardController.createCard);
router.put('/reorder',   authMiddleware, requireAuth, cardController.reorderCards);
router.put('/:id',       authMiddleware, requireAuth, cardController.updateCard);
router.delete('/:id',    authMiddleware, requireAuth, cardController.deleteCard);

module.exports = router;
