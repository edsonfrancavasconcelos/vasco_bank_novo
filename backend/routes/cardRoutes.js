// routes/cardRoutes.js - Revisão: 2024-05-26 11:00:00

// Possíveis melhorias:

// 1. Padronização de nomes de rotas:
//    - Padronizar o nome da rota para maior clareza e consistência.
//    - Usar nomes descritivos e consistentes com a funcionalidade.

// 2. Comentários:
//    - Adicionar comentários para explicar o propósito da rota e do middleware.

// 3. Tratamento de erros:
//    - Considerar adicionar tratamento de erros para a rota, caso a criação do cartão falhe.

const router = require("express").Router();
const { createCard } = require("../controllers/cardController");
const authMiddleware = require("../auth"); // Middleware de autenticação JWT

// Rota para criar um novo cartão de crédito para um usuário autenticado.
router.post("/create", authMiddleware, createCard);

module.exports = router;
