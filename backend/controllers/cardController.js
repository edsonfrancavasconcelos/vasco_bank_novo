// controllers/cardController.js

const Card = require('../models/Card');

// Criar um novo cartão
exports.createCard = async (req, res) => {
  try {
    const { accountId, cardNumber, cardType } = req.body;
    const newCard = new Card({ accountId, cardNumber, cardType });
    await newCard.save();
    res.status(201).json({ message: 'Cartão criado com sucesso', newCard });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cartão' });
  }
};

// Obter todos os cartões
exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter cartões' });
  }
};
