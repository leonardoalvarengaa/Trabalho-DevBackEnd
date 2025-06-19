const clientesService = require('../services/clientesService');
const cache = require('../configs/cache');

exports.getAll = async (req, res) => {
    try {
        const cachedData = cache.get('clientes'); // Tenta pegar do cache
        if (cachedData) {
            console.log('Dados de clientes servidos do CACHE.'); // Log de cache
            return res.json(cachedData);
        }

        const clientes = await clientesService.getAll(); // Pega do DB
        cache.set('clientes', clientes); // Salva no cache
        console.log('Dados de clientes servidos do BANCO DE DADOS e CACHEADOS.'); // Log de DB
        res.json(clientes);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        res.status(500).json({ error: 'Erro interno ao buscar clientes.' });
    }
};

exports.getById = async (req, res) => {
    console.log(`[CONTROLLER DEBUG] Iniciando getById para ID: ${req.params.id}`); 
    try {
        const id = parseInt(req.params.id);
        const cliente = await clientesService.getById(id);

        console.log(`[CONTROLLER DEBUG] Valor de 'cliente' após service.getById:`, cliente);

        if (!cliente) { // Se cliente for null, undefined, 0, false, ''
            const errorMessage = 'Cliente não encontrado.';
            console.log(`[CONTROLLER DEBUG] Cliente NÃO encontrado. PRESTES A ENVIAR 404:`, { error: errorMessage }); 
            
            // ** AQUI ESTÁ A CORREÇÃO FINAL PARA O GETBYID QUE RETORNA 404 **
            // Garante que o Content-Type é application/json e que o corpo é uma string JSON.
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).send(JSON.stringify({ error: errorMessage })); 
        }

        console.log(`[CONTROLLER DEBUG] Cliente encontrado. Enviando 200 JSON.`);
        res.json(cliente);
    } catch (error) {
        console.error('[CONTROLLER DEBUG] Erro inesperado em getById:', error);
        res.status(500).json({ error: 'Erro interno ao buscar cliente.' });
    }
};

exports.create = async (req, res) => {
    try {
        const cliente = req.body;
        const novoCliente = await clientesService.create(cliente);
        cache.del('clientes');
        res.status(201).json(novoCliente);
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const dadosAtualizados = req.body;
        const atualizado = await clientesService.update(id, dadosAtualizados);
        cache.del('clientes');
        res.status(200).json(atualizado);
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
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
        await clientesService.remove(id);
        cache.del('clientes');
        res.status(204).send();
    } catch (error) {
        console.error('Erro ao remover cliente:', error);
        if (error.message.includes('não encontrado')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Erro interno ao remover cliente.' });
        }
    }
};

