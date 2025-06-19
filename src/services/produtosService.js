const pool = require('../configs/database');

exports.getProdutos = async () => {
    const [rows] = await pool.execute('SELECT * FROM produtos');
    return rows;
};

exports.getProdutoById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM produtos WHERE id = ?', [id]);
    return rows[0];
};

exports.createProduto = async (nome, descricao, preco) => {
    const [result] = await pool.execute(
        'INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)',
        [nome, descricao, preco]
    );
    return result.insertId;
};

exports.updateProduto = async (id, nome, descricao, preco) => {
    const [rows] = await pool.execute('SELECT * FROM produtos WHERE id = ?', [id]);
    if (rows.length === 0) {
        throw new Error('Produto não encontrado para atualização.');
    }

    await pool.execute(
        'UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?',
        [nome, descricao, preco, id]
    );

    return { id: parseInt(id), nome, descricao, preco };
};

exports.deleteProduto = async (id) => {
    const [result] = await pool.execute('DELETE FROM produtos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Produto não encontrado.');
    }
};