// src/tests/auth.test.js
const request = require('supertest');
const app = require('../server'); // Ajuste o caminho se necessário
const connection = require('../configs/database');
const authController = require('../controllers/authController'); // Para acessar a blacklist

describe('Auth API', () => {
    const testUser = { usuario: 'authTestUser', senha: 'authTestPassword' };

    beforeAll(async () => {
        await connection.execute('DELETE FROM usuarios WHERE usuario = ?', [testUser.usuario]);
        await request(app).post('/usuarios').send(testUser); // Garante que o usuário exista
    });

    afterEach(() => {
        // Limpar a blacklist em memória a cada teste de logout, se for necessário isolar os testes
        // authController.tokenBlacklist = []; // Isso é mais complexo, pois a blacklist está no módulo
        // Em vez disso, focamos em testar a funcionalidade de logout em si.
    });

    it('Deve realizar login com credenciais válidas e retornar um token', async () => {
        const res = await request(app)
            .post('/login')
            .send(testUser);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
    });

    it('Deve retornar 401 para login com senha inválida', async () => {
        const res = await request(app)
            .post('/login')
            .send({ usuario: testUser.usuario, senha: 'senhaInvalida' });
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Senha inválida.');
    });

    it('Deve retornar 401 para login com usuário não encontrado', async () => {
        const res = await request(app)
            .post('/login')
            .send({ usuario: 'usuarioInexistente', senha: 'algumaSenha' });
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Usuário não encontrado.');
    });

    it('Deve invalidar o token no logout', async () => {
        // Primeiro, faz login para obter um token
        const loginRes = await request(app)
            .post('/login')
            .send(testUser);
        const token = loginRes.body.token;

        // Agora, faz logout com o token
        const logoutRes = await request(app)
            .post('/logout')
            .set('Authorization', `Bearer ${token}`);
        expect(logoutRes.statusCode).toEqual(200);
        expect(logoutRes.body.message).toBe('Logout efetuado com sucesso!');

        // Tenta usar o token invalidado para acessar um recurso protegido (clientes)
        const accessRes = await request(app)
            .get('/clientes')
            .set('Authorization', `Bearer ${token}`);
        expect(accessRes.statusCode).toEqual(401); // Ou 403, dependendo da sua mensagem específica de blacklist
        expect(accessRes.body.message).toBe('Token inválido (logout).'); // Verifica a mensagem da blacklist
    });
});