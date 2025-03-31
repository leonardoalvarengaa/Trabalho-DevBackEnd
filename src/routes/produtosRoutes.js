const express = require("express");
const router = express.Router();
const produtosService = require("../services/produtosService");

// Listar todos os produtos
router.get("/", async (req, res) => {
    const produtos = await produtosService.getProdutos();
    res.json(produtos);
});

// Buscar um produto por ID
router.get("/:id", async (req, res) => {
    const produto = await produtosService.getProdutoById(req.params.id);
    if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json(produto);
});

// Criar um novo produto
router.post("/", async (req, res) => {
    const { nome, descricao, preco } = req.body;
    if (!nome || !descricao || !preco) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    const id = await produtosService.createProduto(nome, descricao, preco);
    res.status(201).json({ id });
});

// Atualizar um produto
router.put("/:id", async (req, res) => {
    const { nome, descricao, preco } = req.body;
    if (!nome || !descricao || !preco) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    await produtosService.updateProduto(req.params.id, nome, descricao, preco);
    res.json({ message: "Produto atualizado com sucesso" });
});

// Excluir um produto
router.delete("/:id", async (req, res) => {
    await produtosService.deleteProduto(req.params.id);
    res.json({ message: "Produto removido com sucesso" });
});

module.exports = router;
