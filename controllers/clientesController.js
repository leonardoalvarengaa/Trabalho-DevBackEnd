const clientesService = require('../services/clientesService');

exports.getAll = async (req, res) => {
    const clientes = await clientesService.getAll();
    res.json(clientes);
};

exports.create = async (req, res) => {
    const novoCliente = await clientesService.create(req.body);
    res.status(201).json(novoCliente);
};

exports.update = async (req, res) => {
    const atualizado = await clientesService.update(req.params.id, req.body);
    res.json(atualizado);
};

exports.remove = async (req, res) => {
    await clientesService.remove(req.params.id);
    res.status(204).send();
};
