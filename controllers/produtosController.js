const produtosService = require('../services/produtosService');

exports.getAll = async (req, res) => {
    const produtos = await produtosService.getAll();
    res.json(produtos);
};

exports.create = async (req, res) => {
    const novoProduto = await produtosService.create(req.body);
    res.status(201).json(novoProduto);
};

exports.update = async (req, res) => {
    const atualizado = await produtosService.update(req.params.id, req.body);
    res.json(atualizado);
};

exports.remove = async (req, res) => {
    await produtosService.remove(req.params.id);
    res.status(204).send();
};
