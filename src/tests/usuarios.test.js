// src/tests/usuarios.test.js (Exemplo de como deveria estar ou ser ajustado)
const request = require('supertest');
const app = require('../server'); // Caminho para sua aplicação Express
const connection = require('../configs/database'); // Se você usa um DB real
const bcrypt = require('bcrypt'); // Para hash de senha no setup
const usuariosService = require('../services/usuariosService'); // Para interagir com o serviço de usuários

describe('Usuários API', () => {
  const testUser = { usuario: 'testuser_usu', senha: 'testpassword_usu' };
  const existingUser = { usuario: 'existing_user_name', senha: 'password123' };

  beforeAll(async () => {
    // Limpar usuários antes de todos os testes deste suite
    await connection.execute('DELETE FROM usuarios');

    // Crie o usuário existente UMA VEZ antes de todos os testes
    // Use o serviço de usuários diretamente para garantir que seja hashed e salvo
    try {
        await usuariosService.create(existingUser);
        console.log(`Usuário existente criado para testes de usuário: ${existingUser.usuario}`);
    } catch (error) {
        // Se o usuário já existir por algum motivo (re-execução), pode ser um aviso.
        // Se for um erro real, ele deve ser reportado.
        console.warn('Aviso no setup do usuário existente para testes de usuário:', error.message);
    }
  });

  afterAll(async () => {
    // Limpar usuários após todos os testes deste suite
    await connection.execute('DELETE FROM usuarios');
    // Não feche a conexão aqui se outros testes ainda forem usá-la (e.g., clientes.test.js)
    // Se este for o último suite a usar o DB, aí sim pode fechar: await connection.end();
  });

  it('Deve criar um novo usuário com sucesso', async () => {
    const res = await request(app)
      .post('/usuarios')
      .send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Usuário criado com sucesso.');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.usuario).toBe(testUser.usuario);
  });

  // ESTE É O TESTE QUE ESTÁ FALHANDO
  it('Não deve criar usuário com nome de usuário já existente', async () => {
    // AQUI VOCÊ TENTA CRIAR O USUÁRIO EXISTENTE NOVAMENTE
    const res = await request(app)
      .post('/usuarios')
      .send(existingUser); // Usa o usuário que já foi criado no beforeAll
    expect(res.statusCode).toEqual(409); // Mude de 500 para 409
    expect(res.body.error).toBe('Nome de usuário já existe.'); // Ajuste para 'error'
  });

  // Outros testes de usuário podem vir aqui...
});