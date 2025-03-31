const db = require("../configs/database");

// Buscar todos os produtos
async function getProdutos() {
    const [rows] = await db.query("SELECT * FROM produtos");
    return rows;
}

// Buscar um produto por ID
async function getProdutoById(id) {
    const [rows] = await db.query("SELECT * FROM produtos WHERE id = ?", [id]);
    return rows[0];
}

// Criar um novo produto
async function createProduto(nome, descricao, preco) {
    const [result] = await db.query(
        "INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)",
        [nome, descricao, preco]
    );
    return result.insertId;
}

// Atualizar um produto
async function updateProduto(id, nome, descricao, preco) {
    await db.query(
        "UPDATE produtos SET nome = ?, descricao = ?, preco = ?, data_atualizado = NOW() WHERE id = ?",
        [nome, descricao, preco, id]
    );
}

// Excluir um produto
async function deleteProduto(id) {
    await db.query("DELETE FROM produtos WHERE id = ?", [id]);
}

module.exports = {
    getProdutos,
    getProdutoById,
    createProduto,
    updateProduto,
    deleteProduto,
};
