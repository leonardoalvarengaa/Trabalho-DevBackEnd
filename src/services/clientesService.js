const connection = require('../configs/database'); // ajusta o caminho se precisar

exports.getAll = async () => {
    const [rows] = await connection.execute('SELECT * FROM clientes');
    return rows;
};

exports.create = async ({ nome, sobrenome, email, idade }) => {
    if (!nome || !sobrenome || !email || !idade) {
        throw new Error("Todos os campos são obrigatórios!");
    }

    const idadeNum = Number(idade);
    if (isNaN(idadeNum) || idadeNum <= 0 || idadeNum >= 100) {
        throw new Error("Idade deve ser um número entre 1 e 99.");
    }

    const [result] = await connection.execute(
        'INSERT INTO clientes (nome, sobrenome, email, idade) VALUES (?, ?, ?, ?)',
        [nome, sobrenome, email, idadeNum]
    );

    return { id: result.insertId, nome, sobrenome, email, idade: idadeNum };
};


exports.update = async (id, { nome, sobrenome, email, idade }) => {
    await connection.execute(
        'UPDATE clientes SET nome = ?, sobrenome = ?, email = ?, idade = ? WHERE id = ?',
        [nome, sobrenome, email, idade, id]
    );
    return { id, nome, sobrenome, email, idade };
};

exports.remove = async (id) => {
    await connection.execute('DELETE FROM clientes WHERE id = ?', [id]);
};
