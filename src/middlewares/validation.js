module.exports = (req, res, next) => {
    const { nome, sobrenome, email, idade } = req.body;

    if (!nome || !sobrenome || !email || idade == null) {
        return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    if (typeof idade !== 'number' || idade < 1 || idade > 99) {
        return res.status(400).json({ erro: 'A idade deve ser um número entre 1 e 99.' });
    }

    next();
};
