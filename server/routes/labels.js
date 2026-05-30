/**
 * Label routes — all mutations require authentication.
 * Fix BUG 3 — guests can no longer create/update/delete labels.
 * Note: /card POST and /card/:id/:id DELETE are before /:id to avoid shadowing.
 */

const express          = require('express');
const router           = express.Router();
const labelController  = require('../controllers/labelController');
const authMiddleware   = require('../middleware/auth');
const requireAuth      = require('../middleware/requireAuth');

router.post('/card',                   authMiddleware, requireAuth, labelController.addLabelToCard);
router.delete('/card/:cardId/:labelId', authMiddleware, requireAuth, labelController.removeLabelFromCard);
router.post('/',                       authMiddleware, requireAuth, labelController.createLabel);
router.put('/:id',                     authMiddleware, requireAuth, labelController.updateLabel);
router.delete('/:id',                  authMiddleware, requireAuth, labelController.deleteLabel);

module.exports = router;
