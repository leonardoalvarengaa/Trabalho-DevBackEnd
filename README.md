# Trabalho Node.js

Este projeto é uma API REST criada com Node.js, Express e MySQL, seguindo uma arquitetura organizada.

## Estrutura do Projeto
- `configs/` - Configuração do banco de dados
- `controllers/` - Lógica de negócio
- `middlewares/` - Validações de dados
- `models/` - Scripts SQL
- `routes/` - Definição de APIs
- `services/` - Comunicação com o banco
- `views/` - Camada de apresentação

## Como Rodar
1. Instale as dependências:
npm install
2. Configure o banco de dados em `.env`
3. Inicie o servidor:
npm run dev

## Endpoints
- `GET /clientes`
- `POST /clientes`
- `PUT /clientes/:id`
- `DELETE /clientes/:id`
- `GET /produtos`
- `POST /produtos`
- `PUT /produtos/:id`
- `DELETE /produtos/:id`

