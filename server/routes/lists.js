const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.post('/', listController.createList);
router.put('/:id', listController.updateList);
router.delete('/:id', listController.deleteList);
router.put('/reorder', listController.reorderLists); // This MUST act on a collection, but usually REST implies /:id for PUT. I'll use /reorder endpoint.

module.exports = router;
