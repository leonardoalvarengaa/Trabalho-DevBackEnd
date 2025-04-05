const clientesService = require('../services/clientesService');

exports.getAll = async (req, res) => {
    const clientes = await clientesService.getAll();
    res.status(200).json(clientes);
};

exports.create = async (req, res) => {
    console.log("Recebido no backend:", req.body);

    if (!req.body.nome || !req.body.sobrenome || !req.body.email || !req.body.idade) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

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
