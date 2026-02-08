const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

router.get('/users', memberController.getUsers);
router.get('/board/:boardId', memberController.getBoardMembers);
router.post('/card', memberController.assignMemberToCard);
router.delete('/card/:cardId/:userId', memberController.removeMemberFromCard);

module.exports = router;
