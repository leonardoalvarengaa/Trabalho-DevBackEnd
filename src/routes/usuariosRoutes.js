const express = require('express');
const usuariosController = require('../controllers/usuariosController');

const router = express.Router();

router.post('/', usuariosController.createUser);
router.get('/', usuariosController.getAllUsers);

module.exports = router;
