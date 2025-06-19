// server.js
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// ** 1. Mova o cors para antes das definições de rotas e do listen **
app.use(cors());

// Middleware pra ler JSON
app.use(express.json());

// Rotas - Mova todas as importações de rotas para o topo para melhor organização
const clientesRoutes = require("./routes/clientesRoutes");
const produtosRoutes = require("./routes/produtosRoutes");
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

// Definindo rotas
app.use("/clientes", clientesRoutes);
app.use("/produtos", produtosRoutes);
app.use('/', authRoutes); // Rotas de autenticação (login/logout)
app.use('/usuarios', usuariosRoutes); // Rotas de usuários

// Servir arquivos estáticos (se aplicável, para a interface web)
app.use(express.static(path.join(__dirname, "views")));

// Rota raiz - Conforme o desafio
app.get("/", (req, res) => {
    // O desafio pede uma mensagem de boas-vindas. Pode ser um arquivo HTML ou um JSON simples.
    // Se você tiver uma página inicial em 'views/index.html':
    res.sendFile(path.join(__dirname, "views", "index.html"));
    // Ou, se for apenas uma mensagem JSON:
    // res.status(200).json({ message: "Bem-vindo à API RESTful!" });
});

// ** 2. Condicionalmente inicia o servidor apenas se NÃO estiver em ambiente de teste **
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000; // Use 5000 como fallback ou 3000 como no seu teste
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        // Mova seus logs de variáveis de ambiente para dentro deste bloco
        console.log('PORT:', process.env.PORT);
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_PASS:', process.env.DB_PASS ? '*****' : 'Not set');
        console.log('DB_NAME:', process.env.DB_NAME);
        console.log('DB Config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS ? '*****' : 'Not set',
            database: process.env.DB_NAME
        });
    });
}

// ** 3. MUITO IMPORTANTE: Exporte a instância do 'app' para uso nos testes **
module.exports = app;