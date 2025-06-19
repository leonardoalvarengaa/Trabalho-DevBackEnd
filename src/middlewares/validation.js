// src/middlewares/validation.js
const Joi = require('joi'); //

// Esquema de validação para clientes
const clienteSchema = Joi.object({
    nome: Joi.string().min(3).max(255).required().messages({
        'string.min': 'O nome deve ter no mínimo 3 caracteres.',
        'string.max': 'O nome deve ter no máximo 255 caracteres.',
        'any.required': 'O nome é obrigatório.'
    }),
    sobrenome: Joi.string().min(3).max(255).required().messages({
        'string.min': 'O sobrenome deve ter no mínimo 3 caracteres.',
        'string.max': 'O sobrenome deve ter no máximo 255 caracteres.',
        'any.required': 'O sobrenome é obrigatório.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'O email deve ter um formato válido.',
        'any.required': 'O email é obrigatório.'
    }),
    idade: Joi.number().integer().min(1).max(119).required().messages({ // Corrigido para < 120
        'number.base': 'A idade deve ser um número.',
        'number.integer': 'A idade deve ser um número inteiro.',
        'number.min': 'A idade deve ser maior que 0.',
        'number.max': 'A idade deve ser menor que 120.',
        'any.required': 'A idade é obrigatória.'
    })
}); //

// Esquema de validação para produtos
const produtoSchema = Joi.object({
    nome: Joi.string().min(3).max(255).required().messages({
        'string.min': 'O nome do produto deve ter no mínimo 3 caracteres.',
        'string.max': 'O nome do produto deve ter no máximo 255 caracteres.',
        'any.required': 'O nome do produto é obrigatório.'
    }),
    descricao: Joi.string().min(3).max(500).required().messages({ // Descrição geralmente é maior
        'string.min': 'A descrição deve ter no mínimo 3 caracteres.',
        'string.max': 'A descrição deve ter no máximo 500 caracteres.',
        'any.required': 'A descrição é obrigatória.'
    }),
    preco: Joi.number().positive().required().messages({
        'number.base': 'O preço deve ser um número.',
        'number.positive': 'O preço deve ser um valor positivo.',
        'any.required': 'O preço é obrigatório.'
    }),
    data_atualizado: Joi.date().iso().min('2000-01-01').max('2025-06-20').optional().messages({ // Opcional para PUT, REQUIRED para POST
        'date.iso': 'A data de atualização deve estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ssZ).',
        'date.min': 'A data de atualização deve ser posterior a 01/01/2000.',
        'date.max': 'A data de atualização deve ser anterior a 20/06/2025.'
    })
}); //

// Middleware genérico de validação
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false }); //

    if (error) { //
        const errorMessage = error.details[0].message; //
        return res.status(400).json({ error: errorMessage }); //
    }
    next(); //
};

// Exporta funções de validação específicas para cada recurso
exports.validateCliente = validate(clienteSchema); //
exports.validateProduto = validate(produtoSchema); //