// routes/index.js - Revisão: 2025-05-06 22:30:00

// Este arquivo agrupa e exporta todas as rotas da API do VascoBank, organizando os endpoints
// para facilitar a manutenção e integração com o servidor Express. As rotas são importadas
// em ordem alfabética para melhor legibilidade.

// Possíveis melhorias implementadas:
// 1. Removidas duplicatas (recoverRoutes, productRoutes).
// 2. Adicionado virtualCardRoutes para suportar /api/virtualCards.
// 3. Removido searchRoutes, que não estava definido.
// 4. Mantida ordem alfabética nas importações e exportações.

// Importação das rotas
const cardRoutes = require('./cardRoutes');
const investmentRoutes = require('./investmentRoutes');
const loginRoutes = require('./loginRoutes');
const loanRoutes = require('./loanRoutes');
const pixRoutes = require('./pixRoutes');
const productRoutes = require('./productRoutes');
const quoteRoutes = require('./quoteRoutes');
const recoverRoutes = require('./recoverRoutes');
const statementRoutes = require('./statementRoutes');
const transactionRoutes = require('./transactionRoutes');
const userRoutes = require('./userRoutes');
const virtualCardRoutes = require('./virtualCardRoutes');

// Exportação das rotas em ordem alfabética
module.exports = {
  cardRoutes,
  investmentRoutes,
  loginRoutes,
  loanRoutes,
  pixRoutes,
  productRoutes,
  quoteRoutes,
  recoverRoutes,
  statementRoutes,
  transactionRoutes,
  userRoutes,
  virtualCardRoutes
};