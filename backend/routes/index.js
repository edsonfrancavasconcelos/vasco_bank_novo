// routes/index.js - Revisão: 2024-05-26 10:30:00

// Possíveis melhorias:

// 1. Adicionar todas as rotas:
//    - O arquivo está faltando o `recoverRoutes`. Incluí-lo para garantir que todas as rotas sejam exportadas.

// 2. Organização:
//    - Manter a ordem alfabética das rotas para facilitar a leitura e manutenção.

// 3. Comentários:
//    - Adicionar um comentário explicativo sobre o propósito do arquivo.

// Este arquivo agrupa e exporta todas as rotas da API.

const cardRoutes = require("./cardRoutes");
const loginRoutes = require("./loginRoutes");
const productRoutes = require("./productRoutes");
const recoverRoutes = require("./recoverRoutes");
const searchRoutes = require("./searchRoutes");
const statementRoutes = require("./statementRoutes");
const transactionRoutes = require("./transactionRoutes");
const userRoutes = require("./userRoutes");


module.exports = {
    cardRoutes,
    loginRoutes,
    productRoutes,
    recoverRoutes,
    searchRoutes,
    statementRoutes,
    transactionRoutes,
    userRoutes,
 
};