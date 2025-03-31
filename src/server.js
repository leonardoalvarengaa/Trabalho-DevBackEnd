const express = require('express');
const path = require('path');
const app = express();

// Configurar o Pug (antigo Jade) como motor de visualização
app.set('view engine', 'pug'); // A partir do Pug, não mais do Jade
app.set('views', path.join(__dirname, 'views')); // Diretório de views

// Definindo uma rota para renderizar o index.jade (ou index.pug)
app.get('/', (req, res) => {
    res.render('index', { title: 'Página Inicial' }); // Passando o título
});

// Rodando o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
