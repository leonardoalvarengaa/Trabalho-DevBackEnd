const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController'); // Importa o controller para acessar a blacklist

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    // Verifica se o token está na blacklist
    if (authController.isTokenBlacklisted(token)) {
        return res.status(401).json({ message: 'Token inválido (logout).' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }
        req.user = user;
        next();
    });
};

module.exports = authMiddleware;