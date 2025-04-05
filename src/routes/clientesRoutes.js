const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const validateCliente = require('../middlewares/validation');

router.get('/', clientesController.getAll);
router.post('/', validateCliente, clientesController.create);
router.put('/:id', validateCliente, clientesController.update);
router.delete('/:id', clientesController.remove);

module.exports = router;
