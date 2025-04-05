require('dotenv').config();
console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS ? '*****' : 'Not set',
    database: process.env.DB_NAME
});

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Middleware pra ler JSON
app.use(express.json());

// Rotas
const clientesRoutes = require("./routes/clientesRoutes");
const produtosRoutes = require("./routes/produtosRoutes");

// Definindo rotas
app.use("/clientes", clientesRoutes);
app.use("/produtos", produtosRoutes);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "views")));

// Rota raiz
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
app.use(cors());

console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS ? '*****' : 'Not set');
console.log('DB_NAME:', process.env.DB_NAME);
