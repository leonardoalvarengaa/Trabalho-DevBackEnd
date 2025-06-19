// src/tests/produtos.test.js (AJUSTADO)
const request = require('supertest');
const app = require('../server');
const connection = require('../configs/database');
const cache = require('../configs/cache'); 
const usuariosService = require('../services/usuariosService');

describe('Produtos API', () => {
    let authToken; 
    let initialTestProductId; // ID para testes de GET que não serão modificados

    beforeAll(async () => {
        await connection.execute('DELETE FROM produtos');
        await connection.execute('DELETE FROM usuarios');
        cache.flushAll(); 

        const user = { usuario: 'testuser', senha: 'testpassword' };
        try {
            await usuariosService.create(user); 
        } catch (e) {
            console.warn('Aviso no setup do usuário para produtos.test.js (pode já existir):', e.message);
        }

        const loginRes = await request(app).post('/login').send(user);
        if (loginRes.statusCode !== 200 || !loginRes.body.token) {
            console.error('Falha no login do usuário de teste para produtos.test.js. Status:', loginRes.statusCode, 'Body:', loginRes.body);
            throw new Error('Falha no setup: Não foi possível obter token de autenticação para os testes de produto.');
        }
        authToken = loginRes.body.token;

        // Criar um produto inicial para testes de GET (que não será alterado por outros testes)
        const initialProductForGet = {
            nome: 'Produto Inicial GET',
            descricao: 'Descrição do produto inicial para testes de GET',
            preco: 10.50
        };
        const createProductResForGet = await request(app)
            .post('/produtos')
            .set('Authorization', `Bearer ${authToken}`)
            .send(initialProductForGet);

        if (createProductResForGet.statusCode === 201 && createProductResForGet.body && createProductResForGet.body.id) {
            initialTestProductId = createProductResForGet.body.id;
            console.log(`Produto de teste inicial para GETs criado com ID: ${initialTestProductId}`);
        } else {
            console.error('Falha ao criar produto inicial para GETs:', createProductResForGet.body);
            throw new Error('Falha no setup: Não foi possível criar produto inicial para testes de GET.');
        }
    });

    afterAll(async () => {
        await connection.execute('DELETE FROM produtos');
        await connection.execute('DELETE FROM usuarios');
        cache.flushAll(); 
        await connection.end(); 
    });

    // --- Testes de Criação ---
    it('Deve criar um novo produto', async () => {
        const newProduct = {
            nome: 'Produto Teste',
            descricao: 'Descrição do produto de teste',
            preco: 25.99
        };
        const res = await request(app)
            .post('/produtos')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newProduct);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.nome).toBe(newProduct.nome);
        // expect(cache.get("produtos")).toBeUndefined(); // A invalidação deve ser feita no controller
    });

    it('Deve retornar 400 se o nome do produto for muito curto', async () => {
        const invalidProduct = {
            nome: 'ab', 
            descricao: 'Descrição curta',
            preco: 10.00
        };
        const res = await request(app)
            .post('/produtos')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidProduct);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined(); // Garante que 'error' existe
        expect(res.body.error).toContain('nome do produto deve ter no mínimo 3 caracteres'); 
    });

    it('Deve retornar 400 se o preço do produto for negativo', async () => {
        const invalidProduct = {
            nome: 'Produto Valido',
            descricao: 'Descrição válida',
            preco: -5.00 
        };
        const res = await request(app)
            .post('/produtos')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidProduct);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined(); 
        expect(res.body.error).toContain('preço deve ser um valor positivo'); 
    });

    // --- Testes de Leitura (GET) ---
    it('Deve retornar todos os produtos', async () => {
        const res = await request(app)
            .get('/produtos')
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('Deve retornar um produto por ID', async () => {
        const res = await request(app)
            .get(`/produtos/${initialTestProductId}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id', initialTestProductId);
        expect(res.body).toHaveProperty('nome', 'Produto Inicial GET');
    });

    it('Deve retornar 404 para produto inexistente (GET por ID)', async () => {
        const res = await request(app)
            .get('/produtos/999999') 
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('Produto não encontrado.');
    });

    // --- Testes de Atualização ---
    it('Deve atualizar um produto existente', async () => {
        // Crie um produto específico para este teste de atualização com DADOS VÁLIDOS
        const productToUpdate = {
            nome: 'Produto Valido Update', // Garanta que nome tem min 3 caracteres
            descricao: 'Descricao Valida do Produto', // Obrigatório e min 3 caracteres
            preco: 50.00 // Preço positivo e numérico
        };
        const createRes = await request(app)
            .post('/produtos')
            .set('Authorization', `Bearer ${authToken}`)
            .send(productToUpdate);
        expect(createRes.statusCode).toEqual(201); // <-- AGORA ISSO DEVE PASSAR!
        const productIdToUpdate = createRes.body.id;

        const updatedData = { nome: 'Produto Atualizado', descricao: 'Nova Descrição', preco: 75.00 };
        const res = await request(app)
            .put(`/produtos/${productIdToUpdate}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(Number(res.body.id)).toEqual(Number(productIdToUpdate));
        expect(res.body.nome).toBe(updatedData.nome);
        expect(cache.get("produtos")).toBeUndefined(); 
    });

    it('Deve retornar 404 ao tentar atualizar produto inexistente', async () => {
        const updatedProduct = {
            nome: 'Produto Inexistente',
            descricao: 'Descrição Inexistente',
            preco: 100.00
        };
        const res = await request(app)
            .put('/produtos/999999') 
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedProduct);
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('Produto não encontrado para atualização.');
    });

    // --- Testes de Remoção ---
    it('Deve remover um produto existente', async () => {
        // Crie um produto específico para este teste de remoção com DADOS VÁLIDOS
        const productToRemove = {
            nome: 'Produto Valido Remove', // Garanta que nome tem min 3 caracteres
            descricao: 'Descricao Valida', // Obrigatório e min 3 caracteres
            preco: 10.00 // Preço positivo e numérico
        };
        const createRes = await request(app)
            .post('/produtos')
            .set('Authorization', `Bearer ${authToken}`)
            .send(productToRemove);
        expect(createRes.statusCode).toEqual(201); // <-- AGORA ISSO DEVE PASSAR!
        const productIdToRemove = createRes.body.id;

        const res = await request(app)
            .delete(`/produtos/${productIdToRemove}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(204);
        expect(cache.get("produtos")).toBeUndefined(); 

        const checkRes = await request(app).get(`/produtos/${productIdToRemove}`).set('Authorization', `Bearer ${authToken}`);
        expect(checkRes.statusCode).toEqual(404);
        expect(checkRes.body.error).toBe('Produto não encontrado.'); 
    });

    it('Deve retornar 404 ao tentar remover produto inexistente', async () => {
        const res = await request(app)
            .delete('/produtos/999999') 
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('Produto não encontrado.');
    });
});