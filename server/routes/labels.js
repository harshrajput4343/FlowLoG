const express = require('express');
const router = express.Router();
const labelController = require('../controllers/labelController');

router.post('/', labelController.createLabel);
router.put('/:id', labelController.updateLabel);
router.delete('/:id', labelController.deleteLabel);
router.post('/card', labelController.addLabelToCard);
router.delete('/card/:cardId/:labelId', labelController.removeLabelFromCard);

module.exports = router;
