const clientesService = require('../services/clientesService');
const cache = require('../configs/cache'); // importa o cache

exports.getAll = async (req, res) => {
    const cachedClientes = cache.get("clientes");

    if (cachedClientes) {
        console.log("\x1b[36m[Cache]\x1b[0m Dados de clientes retornados do cache.");
        return res.status(200).json(cachedClientes);
    }

    const clientes = await clientesService.getAll();
    cache.set("clientes", clientes);
    console.log("\x1b[33m[DB]\x1b[0m Dados de clientes retornados do banco e armazenados no cache.");

    res.status(200).json(clientes);
};

exports.create = async (req, res) => {
    console.log("Recebido no backend:", req.body);

    if (!req.body.nome || !req.body.sobrenome || !req.body.email || !req.body.idade) {
        return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
    }

    const novoCliente = await clientesService.create(req.body);
    cache.del("clientes"); // invalida o cache
    console.log("\x1b[31m[Cache]\x1b[0m Cache de clientes invalidado após criação.");

    res.status(201).json(novoCliente);
};

exports.update = async (req, res) => {
    const atualizado = await clientesService.update(req.params.id, req.body);
    cache.del("clientes"); // invalida o cache
    console.log("\x1b[31m[Cache]\x1b[0m Cache de clientes invalidado após atualização.");

    res.json(atualizado);
};

exports.remove = async (req, res) => {
    await clientesService.remove(req.params.id);
    cache.del("clientes"); // invalida o cache
    console.log("\x1b[31m[Cache]\x1b[0m Cache de clientes invalidado após remoção.");

    res.status(204).send();
};
