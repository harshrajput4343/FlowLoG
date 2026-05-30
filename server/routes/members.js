/**
 * Member routes — mutations require authentication.
 * Fix BUG 3 — guests can no longer assign/remove card members.
 */

const express           = require('express');
const router            = express.Router();
const memberController  = require('../controllers/memberController');
const authMiddleware    = require('../middleware/auth');
const requireAuth       = require('../middleware/requireAuth');

// Read — require auth but not necessarily a non-guest (listing users for the picker)
router.get('/users',                  authMiddleware, memberController.getUsers);
router.get('/board/:boardId',         authMiddleware, memberController.getBoardMembers);

// Writes — require a real user
router.post('/users',                 authMiddleware, requireAuth, memberController.createUser);
router.delete('/users/:id',           authMiddleware, requireAuth, memberController.deleteUser);
router.post('/card',                  authMiddleware, requireAuth, memberController.assignMemberToCard);
router.delete('/card/:cardId/:userId', authMiddleware, requireAuth, memberController.removeMemberFromCard);

module.exports = router;
