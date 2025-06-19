# 🍏 Trabalho Node.js

Este projeto é uma API REST criada com Node.js, Express e MySQL, seguindo uma arquitetura organizada.

## ## Estrutura do Projeto
- `configs/` - Configuração do banco de dados
- `controllers/` - Lógica de negócio
- `middlewares/` - Validações e Autenticação
- `models/` - Scripts SQL
- `routes/` - Definição de APIs
- `services/` - Comunicação com o banco
- `views/` - Camada de apresentação

## ## Como Rodar
1. Instale as dependências:
   `npm install`
2. Configure o banco de dados e variáveis de ambiente no arquivo `.env` (exemplo em `.env.example`).
3. Inicie o servidor:
   `npm run dev`
4. Para rodar os testes:
   `npm test`

## ## Endpoints

### Autenticação
- `POST /login` - Realiza o login e retorna um JWT.
- `POST /logout` - Invalida o token JWT atual.

### Clientes (Requer Autenticação)
- `GET /clientes` - Lista todos os clientes (com cache).
- `POST /clientes` - Cria um novo cliente.
- `PUT /clientes/:id` - Atualiza um cliente existente.
- `DELETE /clientes/:id` - Remove um cliente.

### Produtos (Acesso Público)
- `GET /produtos` - Lista todos os produtos.
- `GET /produtos/:id` - Retorna um produto específico por ID.
- `POST /produtos` - Cria um novo produto.
- `PUT /produtos/:id` - Atualiza um produto existente.
- `DELETE /produtos/:id` - Remove um produto.

### Usuários
- `POST /usuarios` - Cria um novo usuário.
- `GET /usuarios` - Lista todos os usuários (sem senha/token).