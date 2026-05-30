const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const authMiddleware = require('../middleware/auth');

// All board routes require authentication
router.get('/', authMiddleware, boardController.getBoards);
router.post('/', authMiddleware, boardController.createBoard);

// Public route to get board by share token (Must be declared before /:id)
router.get('/share/:token', boardController.getBoardByShareToken);

router.get('/:id', authMiddleware, boardController.getBoardById);
router.delete('/:id', authMiddleware, boardController.deleteBoard);
router.put('/:id', authMiddleware, boardController.updateBoard);

// Private route to generate share token
router.post('/:id/share', authMiddleware, boardController.generateShareToken);

module.exports = router;
