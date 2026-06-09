const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { chat } = require('../controllers/flowguideController');

// All FlowGuide routes require authentication
router.post('/chat', authMiddleware, chat);

module.exports = router;
