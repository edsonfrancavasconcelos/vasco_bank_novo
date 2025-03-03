// routes/cardRoutes.js
const express = require('express');
const { createCard, getCards } = require('../controllers/cardController');
const router = express.Router();

// Rota para criar um novo cartão
router.post('/create', createCard);

// Rota para obter cartões de uma conta
router.get('/:accountId', getCards);

module.exports = router;
