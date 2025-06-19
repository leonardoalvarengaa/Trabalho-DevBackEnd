// src/controllers/usuariosController.js
const usuariosService = require('../services/usuariosService'); // Importe o service

exports.createUser = async (req, res) => {
  try {
    const { usuario, senha } = req.body; // Ajuste para 'usuario' e 'senha' se for isso que vem do corpo da requisição

    // Usar o service para criar o usuário. O service deve lidar com a lógica de duplicidade e hashing.
    const novoUsuario = await usuariosService.create({ usuario, senha }); 
    res.status(201).json({ message: 'Usuário criado com sucesso.', user: novoUsuario });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    // Verificar se o erro é de conflito (nome de usuário já existe)
    if (error.message === 'Nome de usuário já existe.') {
      return res.status(409).json({ error: error.message });
    }
    // Para outros erros (ex: validação de campos obrigatórios), pode retornar 400
    if (error.message === 'Nome de usuário e senha são obrigatórios.') {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Se você tiver um método no service para buscar todos os usuários, use-o aqui:
    // const usuarios = await usuariosService.getAllUsers();
    // res.status(200).json(usuarios);

    // Mantenho o exemplo original se não tiver um service para getAllUsers ainda
    res.status(200).json([{ id: 1, nome: 'Leozin', email: 'leozin@example.com' }]);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};