const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/', clientesController.getAll);
router.post('/', clientesController.create);
router.put('/:id', clientesController.update);
router.delete('/:id', clientesController.remove);

module.exports = router;
