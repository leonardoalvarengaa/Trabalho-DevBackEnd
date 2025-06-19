const pool = require('../configs/database');

exports.getAll = async () => {
    const [rows] = await pool.execute('SELECT * FROM clientes');
    return rows;
};

exports.getById = async (id) => {
    console.log(`[SERVICE DEBUG] Buscando cliente com ID: ${id} no banco de dados.`); // <-- ADICIONE ESTA LINHA
    const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
    const clienteEncontrado = rows[0];
    console.log(`[SERVICE DEBUG] Resultado do DB para ID ${id}:`, clienteEncontrado ? 'Encontrado' : 'Não encontrado', clienteEncontrado); // <-- ADICIONE ESTA LINHA
    return clienteEncontrado; 
};

exports.create = async (cliente) => {
    const { nome, sobrenome, email, idade } = cliente;
    const [result] = await pool.execute(
        'INSERT INTO clientes (nome, sobrenome, email, idade) VALUES (?, ?, ?, ?)',
        [nome, sobrenome, email, idade]
    );

    return {
        id: result.insertId,
        nome,
        sobrenome,
        email,
        idade
    };
};

exports.update = async (id, dados) => {
    const [result] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
    if (result.length === 0) {
        throw new Error('Cliente não encontrado para atualização.');
    }

    const campos = [];
    const valores = [];

    if (dados.nome) {
        campos.push('nome = ?');
        valores.push(dados.nome);
    }
    if (dados.sobrenome) {
        campos.push('sobrenome = ?');
        valores.push(dados.sobrenome);
    }
    if (dados.email) {
        campos.push('email = ?');
        valores.push(dados.email);
    }
    if (dados.idade !== undefined) {
        campos.push('idade = ?');
        valores.push(dados.idade);
    }

    if (campos.length === 0) {
        throw new Error('Nenhum campo válido para atualização.');
    }

    valores.push(id);
    await pool.execute(`UPDATE clientes SET ${campos.join(', ')} WHERE id = ?`, valores);

    return { id: parseInt(id), ...dados };
};

exports.remove = async (id) => {
    const [result] = await pool.execute('DELETE FROM clientes WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Cliente não encontrado.');
    }
};

