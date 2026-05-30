/**
 * List routes
 *
 * Fix BUG 4 — /reorder MUST be declared before /:id
 * (Express matches top-to-bottom; PUT /reorder was previously caught by PUT /:id
 *  with id="reorder", causing parseInt("reorder")=NaN and a Prisma crash.)
 *
 * Fix BUG 3 / guest writes — requireAuth on all mutating routes
 */

const express      = require('express');
const router       = express.Router();
const listController = require('../controllers/listController');
const authMiddleware = require('../middleware/auth');
const requireAuth    = require('../middleware/requireAuth');

// All list mutations require a real user
router.post('/',         authMiddleware, requireAuth, listController.createList);
router.put('/reorder',   authMiddleware, requireAuth, listController.reorderLists);  // MUST be before /:id
router.put('/:id',       authMiddleware, requireAuth, listController.updateList);
router.delete('/:id',    authMiddleware, requireAuth, listController.deleteList);

module.exports = router;
