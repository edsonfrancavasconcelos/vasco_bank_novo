const VirtualCard = require('../models/VirtualCard');

// Obter todos os cartões virtuais do usuário autenticado
exports.getUserVirtualCards = async (req, res) => {
  try {
    const virtualCards = await VirtualCard.find({ userId: req.user.id });
    res.json(virtualCards);
  } catch (error) {
    console.error('Erro ao buscar cartões virtuais:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Criar um novo cartão virtual
exports.createVirtualCard = async (req, res) => {
  const { cardNumber, type } = req.body;
  try {
    if (!cardNumber || !type) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const virtualCard = new VirtualCard({
      userId: req.user.id,
      cardNumber,
      type,
    });
    await virtualCard.save();
    res.status(201).json(virtualCard);
  } catch (error) {
    console.error('Erro ao criar cartão virtual:', error);
    res.status(400).json({ error: 'Dados de cartão virtual inválidos' });
  }
};