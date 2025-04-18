const mongoose = require('mongoose');
const Card = require('../models/Card');
const User = require('../models/User');

const createCard = async (req, res) => {
  try {
    const { fullName, cpf, rg, address, cardPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('email');
    const email = req.body.email || (user ? user.email : null);

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const existingCard = await Card.findOne({ cpf });
    if (existingCard) {
      return res.status(400).json({ error: 'Já existe um cartão associado a esse CPF' });
    }

    const generateCardNumber = () => {
      const randomNum = Math.floor(100000000000 + Math.random() * 900000000000);
      return '4000' + randomNum.toString();
    };

    const cardNumber = generateCardNumber();

    const card = new Card({
      userId,
      fullName,
      email,
      rg,
      cpf,
      address,
      cardPassword,
      number: cardNumber,
      type: 'physical'
    });

    await card.save();
    res.status(201).json({
      message: 'Cartão criado com sucesso',
      card: { number: card.number, type: card.type, status: card.status }
    });
  } catch (error) {
    console.error('Erro ao criar cartão:', error.stack);
    res.status(500).json({ error: 'Erro ao criar cartão' });
  }
};

const createVirtualCard = async (req, res) => {
  try {
    const { cardName } = req.body;
    if (!cardName) {
      return res.status(400).json({ error: 'Nome no cartão é obrigatório' });
    }

    const user = await User.findById(req.user.id);
    const generateCardNumber = () => {
      const randomNum = Math.floor(100000000000 + Math.random() * 900000000000);
      return '4000' + randomNum.toString();
    };

    const cardNumber = generateCardNumber();

    const card = new Card({
      userId: req.user.id,
      fullName: cardName,
      email: user.email,
      cpf: user.cpf, // Supondo que User tenha cpf
      cardPassword: '0000', // Gerar senha temporária
      number: cardNumber,
      type: 'virtual',
      status: 'active'
    });

    await card.save();
    res.status(201).json({
      message: 'Cartão virtual criado com sucesso',
      card: { number: card.number, type: card.type, status: card.status }
    });
  } catch (error) {
    console.error('Erro ao criar cartão virtual:', error.stack);
    res.status(500).json({ error: 'Erro ao criar cartão virtual' });
  }
};

const replacePhysicalCard = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Motivo é obrigatório' });
    }

    // Simulação: registrar solicitação
    res.json({ message: 'Solicitação de novo cartão registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao solicitar novo cartão:', error.stack);
    res.status(500).json({ error: 'Erro ao solicitar novo cartão' });
  }
};

const activateCard = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ error: 'ID do cartão é obrigatório' });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: 'ID do cartão inválido' });
    }

    const card = await Card.findOneAndUpdate(
      { _id, userId: req.user.id, status: 'pending' },
      { status: 'active' },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado ou já ativado' });
    }

    res.json({ message: 'Cartão ativado com sucesso' });
  } catch (error) {
    console.error('Erro ao ativar cartão:', error.stack);
    res.status(500).json({ error: 'Erro ao ativar cartão' });
  }
};

const unlockCard = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id) {
      return res.status(400).json({ error: 'ID do cartão é obrigatório' });
    }

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: 'ID do cartão inválido' });
    }

    const card = await Card.findOneAndUpdate(
      { _id, userId: req.user.id, status: 'blocked' },
      { status: 'active' },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ error: 'Cartão não encontrado ou não está bloqueado' });
    }

    res.json({ message: 'Cartão desbloqueado com sucesso', card: { number: card.number, status: card.status } });
  } catch (error) {
    console.error('Erro ao desbloquear cartão:', error.stack);
    res.status(500).json({ error: 'Erro ao desbloquear cartão' });
  }
};

const getCards = async (req, res) => {
  try {
    console.log('Buscando cartões para userId:', req.user.id);
    const cards = await Card.find({ userId: req.user.id }).select('number type status _id');
    res.json(cards);
  } catch (error) {
    console.error('Erro ao buscar cartões:', error.stack);
    res.status(500).json({ error: 'Erro ao buscar cartões' });
  }
};

module.exports = {
  createCard,
  createVirtualCard,
  replacePhysicalCard,
  activateCard,
  unlockCard,
  getCards
};