// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../configs/database'); // Ajuste o caminho se precisar

// A blacklist deve ser persistente em um cenário real (ex: Redis).
// Para o desafio, uma array em memória é aceitável, mas ela será redefinida ao reiniciar o servidor.
let tokenBlacklist = [];

exports.login = async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        const [rows] = await pool.execute('SELECT id, usuario, senha FROM usuarios WHERE usuario = ?', [usuario]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }

        // Adição para depuração: Verifique se JWT_SECRET está carregado
        if (!process.env.JWT_SECRET) {
             console.error("ERRO: JWT_SECRET não definido nas variáveis de ambiente! Verifique seu arquivo .env e o dotenv.");
             return res.status(500).json({ message: "Erro de configuração do servidor: Chave JWT não encontrada." });
        }

        const token = jwt.sign({ id: user.id, usuario: user.usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
};

exports.logout = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        tokenBlacklist.push(token); // Adiciona o token à blacklist 
    }

    res.json({ message: 'Logout efetuado com sucesso!' });
};

exports.isTokenBlacklisted = (token) => {
    return tokenBlacklist.includes(token);
};