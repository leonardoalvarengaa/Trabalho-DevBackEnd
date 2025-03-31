const pool = require('../configs/database'); // Certifique-se de ter uma conexão configurada

exports.getAll = async () => {
    const [rows] = await pool.query('SELECT * FROM clientes');
    return rows;
};

exports.create = async (cliente) => {
    const { nome, sobrenome, email, idade } = cliente;
    const [result] = await pool.query(
        'INSERT INTO clientes (nome, sobrenome, email, idade) VALUES (?, ?, ?, ?)',
        [nome, sobrenome, email, idade]
    );
    return { id: result.insertId, ...cliente };
};

exports.update = async (id, cliente) => {
    const { nome, sobrenome, email, idade } = cliente;
    await pool.query(
        'UPDATE clientes SET nome=?, sobrenome=?, email=?, idade=? WHERE id=?',
        [nome, sobrenome, email, idade, id]
    );
    return { id, ...cliente };
};

exports.remove = async (id) => {
    await pool.query('DELETE FROM clientes WHERE id=?', [id]);
};
