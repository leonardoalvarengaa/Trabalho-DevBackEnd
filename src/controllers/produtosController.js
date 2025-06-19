const produtosService = require('../services/produtosService');
const cache = require('../configs/cache');

exports.getAll = async (req, res) => {
    try {
        const produtos = await produtosService.getProdutos(); // Ajustado para getProdutos
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro interno ao buscar produtos.' });
    }
};

exports.getById = async (req, res) => {
    try {
        const produto = await produtosService.getProdutoById(parseInt(req.params.id)); // Ajustado para getProdutoById
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        res.json(produto);
    } catch (error) {
        console.error('Erro ao buscar produto por ID:', error);
        res.status(500).json({ error: 'Erro interno ao buscar produto.' });
    }
};

exports.create = async (req, res) => {
    try {
        const { nome, descricao, preco } = req.body; // Desestruture os campos
        // CORREÇÃO AQUI: Chamando o método correto do service
        const novoProdutoId = await produtosService.createProduto(nome, descricao, preco);
        cache.del('produtos');
        // Retorne o objeto completo do novo produto se o frontend precisar
        res.status(201).json({ id: novoProdutoId, nome, descricao, preco }); 
    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, descricao, preco } = req.body; // Desestruture os campos
        const atualizado = await produtosService.updateProduto(id, nome, descricao, preco); // Passe os campos individualmente
        cache.del('produtos');
        res.status(200).json(atualizado);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        if (error.message.includes('não encontrado')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

exports.remove = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await produtosService.deleteProduto(id);
        cache.del('produtos');
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        if (error.message.includes('não encontrado')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Erro interno ao remover produto.' });
        }
    }
};