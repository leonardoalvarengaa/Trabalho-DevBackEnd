const validateCliente = (req, res, next) => {
    const { nome, sobrenome, email, idade } = req.body;
    if (!nome || !sobrenome || !email || !idade) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios" });
    }
    next();
};

module.exports = { validateCliente };
