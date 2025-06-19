// src/routes/clientesRoutes.js
const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { validateCliente } = require('../middlewares/validation'); // Importa o validateCliente específico
const authMiddleware = require('../middlewares/auth'); // Importa o middleware de autenticação

// Todas as rotas de clientes requerem autenticação

// Rota para listar todos os clientes
router.get('/', authMiddleware, clientesController.getAll);

// Rota para buscar cliente por ID (ADICIONE ESTA LINHA)
router.get('/:id', authMiddleware, clientesController.getById); // <--- ADICIONE ESTA LINHA!

// Rota para criar cliente
router.post('/', authMiddleware, validateCliente, clientesController.create);

// Rota para atualizar cliente
router.put('/:id', authMiddleware, validateCliente, clientesController.update);

// Rota para remover cliente
router.delete('/:id', authMiddleware, clientesController.remove);

module.exports = router;