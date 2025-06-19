// jest.config.js
module.exports = {
  // Define onde o Jest deve procurar por arquivos de teste
  testMatch: [
    "<rootDir>/src/tests/**/*.test.js" // Isso fará o Jest procurar apenas por arquivos .test.js dentro de src/tests/
  ],
  // Ignora pastas que não contêm testes de backend
  testPathIgnorePatterns: [
    "/node_modules/",
    "/frontend/" // Adiciona a pasta frontend para ser ignorada
  ],
  // Se você estiver usando módulos ES (import/export), pode precisar disso
  // transform: {},
  // moduleFileExtensions: ['js', 'json', 'node'],
  // clearMocks: true, // Limpa mocks entre cada teste
  // resetMocks: true, // Reseta o estado dos mocks entre cada teste
  // resetModules: true, // Reseta o módulo de importação entre os testes
  // restoreMocks: true, // Restaura o estado original dos mocks após cada teste
};