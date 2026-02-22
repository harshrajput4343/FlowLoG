const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const authMiddleware = require('../middleware/auth');

// All board routes require authentication
router.get('/', authMiddleware, boardController.getBoards);
router.post('/', authMiddleware, boardController.createBoard);
router.get('/:id', authMiddleware, boardController.getBoardById);
router.delete('/:id', authMiddleware, boardController.deleteBoard);
router.put('/:id', authMiddleware, boardController.updateBoard);

module.exports = router;
