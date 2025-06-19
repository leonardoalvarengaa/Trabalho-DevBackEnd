// src/tests/clientes.test.js (AJUSTADO)
const request = require('supertest');
const app = require('../server'); 
const connection = require('../configs/database');
const cache = require('../configs/cache'); 
const usuariosService = require('../services/usuariosService');

describe('Clientes API', () => {
    let authToken; 
    let initialTestClientId; // ID para testes de GET que não serão modificados

    beforeAll(async () => {
        await connection.execute('DELETE FROM clientes');
        await connection.execute('DELETE FROM usuarios'); 
        cache.flushAll(); 

        const user = { usuario: 'testuser', senha: 'testpassword' };
        
        try {
            await usuariosService.create(user); 
        } catch (e) {
            console.warn('Aviso no setup do usuário para clientes.test.js (pode já existir):', e.message);
        }

        const loginRes = await request(app).post('/login').send(user);
        
        if (loginRes.statusCode !== 200 || !loginRes.body.token) {
            console.error('Falha no login do usuário de teste para clientes.test.js. Status:', loginRes.statusCode, 'Body:', loginRes.body);
            throw new Error('Falha no setup: Não foi possível obter token de autenticação para os testes de cliente.');
        }
        authToken = loginRes.body.token;
        console.log('Token de autenticação obtido com sucesso para testes de cliente.');

        // Criar um cliente inicial para testes de GET (que não será alterado por outros testes)
        const initialClientForGet = {
            nome: 'Cliente Para Get',
            sobrenome: 'Existente',
            email: 'clienteget@example.com',
            idade: 30
        };
        const createClientResForGet = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(initialClientForGet);

        if (createClientResForGet.statusCode === 201 && createClientResForGet.body && createClientResForGet.body.id) {
            initialTestClientId = createClientResForGet.body.id;
            console.log(`Cliente de teste inicial para GETs criado com ID: ${initialTestClientId}`);
        } else {
            console.error('Falha ao criar cliente inicial para GETs:', createClientResForGet.body);
            throw new Error('Falha no setup: Não foi possível criar cliente inicial para testes de GET.');
        }
    });

    afterAll(async () => {
        await connection.execute('DELETE FROM clientes');
        await connection.execute('DELETE FROM usuarios');
        cache.flushAll(); 
        await connection.end(); 
    });

    // --- Testes de Autenticação para Clientes (estes devem passar agora) ---
    it('Deve retornar 401 se não houver token para GET /clientes', async () => {
        const res = await request(app).get('/clientes');
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Token não fornecido.');
    });

    it('Deve retornar 403 se o token for inválido para GET /clientes', async () => {
        const res = await request(app).get('/clientes').set('Authorization', 'Bearer invalidtoken');
        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toBe('Token inválido.');
    });

    // --- Testes de CRUD para Clientes (com autenticação) ---
    it('Deve criar um novo cliente com autenticação', async () => {
        const newClient = {
            nome: 'Teste Novo',
            sobrenome: 'Cliente Recem Criado',
            email: 'teste.recem.criado@example.com',
            idade: 30
        };
        const res = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newClient);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.nome).toBe(newClient.nome);
        // O cache deve ser invalidado pelo controller
        // expect(cache.get("clientes")).toBeUndefined(); // Removi esta linha aqui. A invalidação deve ser testada em um teste dedicado ou com mocks mais robustos.
    });

    it('Deve listar clientes e usar o cache na segunda requisição', async () => {
        cache.flushAll(); 

        const res1 = await request(app).get('/clientes').set('Authorization', `Bearer ${authToken}`);
        expect(res1.statusCode).toEqual(200);
        expect(Array.isArray(res1.body)).toBe(true);
    });

    it('Deve invalidar o cache de clientes após uma criação', async () => {
        cache.set("clientes", [{ id: 99, nome: "Cached Client" }]); 
        
        const newClient = {
            nome: 'Novo',
            sobrenome: 'Cliente Cache Inval',
            email: 'novo.cliente.cache.inval@example.com',
            idade: 25
        };
        const res = await request(app) // <-- Captura a resposta da criação
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(newClient);
        
        // Verifique se a criação foi bem-sucedida antes de checar o cache
        expect(res.statusCode).toEqual(201);
        expect(cache.get("clientes")).toBeUndefined(); 
    });

    // Testes de atualização e remoção: Crie o cliente dentro do IT
     it('Deve atualizar um cliente existente', async () => {
        // Crie um cliente específico para este teste de atualização com DADOS VÁLIDOS
        const clientToUpdate = {
            nome: 'Cliente Valido Update', // Garanta que nome tem min 3 caracteres
            sobrenome: 'Sobrenome Valido', // Obrigatório
            email: 'update@example.com',   // Formato de email válido
            idade: 40                      // Idade dentro do range
        };
        const createRes = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(clientToUpdate);
        expect(createRes.statusCode).toEqual(201); // <-- AGORA ISSO DEVE PASSAR!
        const clientIdToUpdate = createRes.body.id;

        const updatedData = { nome: 'Updated', sobrenome: 'Client', email: 'updated@example.com', idade: 45 };
        const res = await request(app)
            .put(`/clientes/${clientIdToUpdate}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedData);

        expect(res.statusCode).toEqual(200);
        expect(Number(res.body.id)).toEqual(Number(clientIdToUpdate));
        expect(res.body.nome).toBe(updatedData.nome); 
        expect(cache.get("clientes")).toBeUndefined(); 
    });

    it('Deve retornar 404 ao tentar atualizar cliente inexistente', async () => {
        const updatedClient = {
            nome: 'Cliente Inexistente',
            sobrenome: 'Inexistente',
            email: 'inexistente@example.com',
            idade: 50
        };
        const res = await request(app)
            .put('/clientes/999999') 
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedClient);
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('Cliente não encontrado para atualização.');
    });

     it('Deve remover um cliente existente', async () => {
        const clientToRemove = {
            nome: 'Cliente Valido Remove',
            sobrenome: 'Sobrenome Valido',
            email: 'remove@example.com',
            idade: 20
        };
        const createRes = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(clientToRemove);
        expect(createRes.statusCode).toEqual(201); 
        const clientIdToRemove = createRes.body.id;

        const res = await request(app)
            .delete(`/clientes/${clientIdToRemove}`)
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(204);
        expect(cache.get("clientes")).toBeUndefined(); 

        const checkRes = await request(app).get(`/clientes/${clientIdToRemove}`).set('Authorization', `Bearer ${authToken}`);
        console.log(`[DEBUG - ULTIMA TENTATIVA] Status code da verificação de cliente removido: ${checkRes.statusCode}`);
        console.log(`[DEBUG - ULTIMA TENTATIVA] Body.error raw: ${checkRes.body.error}`); // Ainda pode ser undefined aqui
        console.log(`[DEBUG - ULTIMA TENTATIVA] Raw text response (checkRes.text):`, checkRes.text); // <--- LOG NOVO E CRÍTICO

        expect(checkRes.statusCode).toEqual(404);
        
        // ** AQUI ESTÁ A CORREÇÃO NO TESTE **
        // Vamos tentar parsear o texto bruto da resposta para pegar o erro
        let parsedBody;
        try {
            parsedBody = JSON.parse(checkRes.text);
        } catch (e) {
            console.error('[TEST ERROR] Falha ao parsear JSON do corpo da resposta:', e);
            // Se não for JSON, então o corpo pode ser a própria string de erro
            expect(checkRes.text).toBe('Cliente não encontrado.'); // Se o controller estiver usando res.send("Cliente não encontrado.")
            return; // Sai do teste se for texto puro
        }

        // Se o parse foi bem-sucedido, então o 'error' deve estar dentro do objeto
        expect(parsedBody.error).toBe('Cliente não encontrado.'); 
    });

    it('Deve retornar 404 ao tentar remover cliente inexistente', async () => {
        const res = await request(app)
            .delete('/clientes/999999') 
            .set('Authorization', `Bearer ${authToken}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('Cliente não encontrado.');
    });

    // --- Testes de Validação para Clientes ---
    // Estes testes de validação dependem que seu middleware de validação retorne { error: "mensagem" }
    // A propriedade 'error' no res.body deve ser uma string única com a mensagem.
    it('Não deve criar cliente com campos faltando', async () => {
        const invalidClient = { nome: 'Incompleto' }; 
        const res = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidClient);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined(); 
        expect(res.body.error).toContain('obrigatório'); 
    });

    it('Não deve criar cliente com nome muito curto', async () => {
        const invalidClient = {
            nome: 'ab', 
            sobrenome: 'Sobrenome',
            email: 'shortname@example.com',
            idade: 20
        };
        const res = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidClient);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined();
        expect(res.body.error).toContain('no mínimo 3 caracteres');
    });

    it('Não deve criar cliente com email inválido', async () => {
        const invalidClient = {
            nome: 'Nome',
            sobrenome: 'Sobrenome',
            email: 'emailinvalido',
            idade: 20
        };
        const res = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidClient);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined();
        expect(res.body.error).toContain('formato válido');
    });

    it('Não deve criar cliente com idade fora do range (menor)', async () => {
        const invalidClient = {
            nome: 'Nome',
            sobrenome: 'Sobrenome',
            email: 'test@example.com',
            idade: 0
        };
        const res = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidClient);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined();
        expect(res.body.error).toContain('maior que 0');
    });

    it('Não deve criar cliente com idade fora do range (maior)', async () => {
        const invalidClient = {
            nome: 'Nome',
            sobrenome: 'Sobrenome',
            email: 'test@example.com',
            idade: 120
        };
        const res = await request(app)
            .post('/clientes')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidClient);
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined();
        expect(res.body.error).toContain('menor que 120');
    });
});