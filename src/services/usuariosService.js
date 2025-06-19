// src/services/usuariosService.js
const pool = require('../configs/database'); // Importe o pool do seu banco de dados
const bcrypt = require('bcrypt'); // Importe bcrypt para hashing de senha

exports.findByUsername = async (usuario) => {
    const [rows] = await pool.execute('SELECT id, usuario, senha FROM usuarios WHERE usuario = ?', [usuario]);
    return rows[0]; // Retorna o primeiro usuário encontrado, ou undefined
};

exports.create = async (novoUsuario) => {
    const { usuario, senha } = novoUsuario;

    // 1. Verificar se o usuário já existe
    const existingUser = await exports.findByUsername(usuario);
    if (existingUser) {
        throw new Error('Nome de usuário já existe.'); // Lança um erro para o controller capturar
    }

    // 2. Validações básicas
    if (!usuario || !senha) {
        throw new Error('Nome de usuário e senha são obrigatórios.');
    }

    // 3. Hash da senha antes de salvar
    const hashedPassword = await bcrypt.hash(senha, 10); // 10 é o saltRounds, valor recomendado

    // 4. Inserir no banco de dados
    const [result] = await pool.execute(
        'INSERT INTO usuarios (usuario, senha) VALUES (?, ?)',
        [usuario, hashedPassword]
    );
    return { id: result.insertId, usuario: usuario }; // Retorna o usuário criado com o ID
};