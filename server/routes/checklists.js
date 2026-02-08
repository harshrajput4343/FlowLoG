const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklistController');

router.post('/', checklistController.createChecklist);
router.delete('/:id', checklistController.deleteChecklist);
router.post('/:id/items', checklistController.addChecklistItem);
router.put('/items/:id', checklistController.updateChecklistItem);
router.patch('/items/:id/toggle', checklistController.toggleChecklistItem);
router.delete('/items/:id', checklistController.deleteChecklistItem);

module.exports = router;
