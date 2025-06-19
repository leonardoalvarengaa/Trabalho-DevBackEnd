// src/routes/produtosRoutes.js
const express = require('express');
const router = express.Router();
const produtosController = require('../controllers/produtosController');
const { validateProduto } = require('../middlewares/validation'); // Importa o validateProduto específico

// Rotas de produtos (públicas, não requerem autenticação) 
router.get('/', produtosController.getAll);
router.get('/:id', produtosController.getById);
router.post('/', validateProduto, produtosController.create);
router.put('/:id', validateProduto, produtosController.update);
router.delete('/:id', produtosController.remove);

module.exports = router;