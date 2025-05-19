const express = require('express');
const router = express.Router();
const VirtualCard = require('../models/VirtualCard');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

console.log('virtualCardRoutes carregado em:', new Date().toISOString());

// Validar authMiddleware
if (!authMiddleware || typeof authMiddleware !== 'function') {
  console.error('Erro: authMiddleware não está definido ou não é uma função');
  throw new Error('Middleware de autenticação não configurado corretamente');
}

// Rota de teste
router.get('/test', (req, res) => {
  console.log('Acessada rota de teste /api/virtualCards/test');
  res.json({ message: 'Rota de teste funcionando' });
});

// Listar cartões virtuais do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Buscando cartões para userId:', userId);

    const cards = await VirtualCard.find({ userId }).select('-cvv');
    if (!cards || cards.length === 0) {
      console.log('Nenhum cartão encontrado para userId:', userId);
      return res.status(404).json({ message: 'Nenhum cartão virtual encontrado' });
    }

    const formattedCards = cards.map(card => {
      console.log('Cartão retornado:', { _id: card._id, logo: card.logo });
      return {
        _id: card._id,
        lastFour: card.number.slice(-4),
        expiry: card.expiry,
        limit: card.limit,
        type: card.type,
        status: card.status || 'active',
        fullName: card.fullName,
        brand: card.brand || 'Visa',
        logo: card.logo || 'vbank'
      };
    });

    res.status(200).json(formattedCards);
  } catch (error) {
    console.error('Erro ao listar cartões:', error.message);
    res.status(500).json({ error: 'Erro ao listar cartões virtuais' });
  }
});

// Criar cartão virtual
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { limit, type, brand = 'Visa', cvv } = req.body;
    const userId = req.user.id;
    console.log('Requisição recebida:', { limit, type, brand, cvv, userId });

    // Validar CVV
    if (!cvv || !/^\d{3}$/.test(cvv)) {
      return res.status(400).json({ error: 'CVV inválido, deve ser 3 dígitos' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const cardData = {
      userId,
      fullName: user.fullName || 'Titular Padrão',
      type: type || 'multi-use',
      limit: limit || 500,
      brand: brand || 'Visa',
      number: `1234 5678 9012 ${Math.floor(1000 + Math.random() * 9000)}`,
      expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleString('pt-BR', { month: '2-digit', year: '2-digit' }).replace(/\/20(\d{2})/, '/$1'),
      cvv,
      logo: 'vbank',
      status: 'active',
      createdAt: new Date()
    };

    console.log('CardData:', cardData);

    const card = new VirtualCard(cardData);
    await card.save();

    console.log('Cartão salvo:', card.toObject());

    res.status(201).json({
      message: 'Cartão virtual criado com sucesso',
      card: {
        _id: card._id,
        number: card.number,
        expiry: card.expiry,
        type: card.type,
        limit: card.limit,
        fullName: card.fullName,
        brand: card.brand,
        lastFour: card.number.slice(-4),
        logo: card.logo,
        status: card.status
      }
    });
  } catch (error) {
    console.error('Erro ao criar cartão:', error.message);
    res.status(500).json({ error: error.message || 'Erro ao criar cartão virtual' });
  }
});

// Excluir cartão virtual
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;
    console.log('Tentando excluir cartão:', { cardId, userId });

    const card = await VirtualCard.findOneAndDelete({ _id: cardId, userId });
    if (!card) {
      console.log('Cartão não encontrado ou não pertence ao usuário:', cardId);
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    console.log('Cartão excluído com sucesso:', cardId);
    res.status(200).json({ message: 'Cartão virtual excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cartão:', error.message);
    res.status(500).json({ error: 'Erro ao excluir cartão virtual' });
  }
});

module.exports = router;