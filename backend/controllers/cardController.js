const mongoose = require('mongoose');
const Card = require('../models/Card');
const CardRequest = require('../models/CardRequest');
const User = require('../models/User');

const generateCardNumber = async () => {
  let cardNumber;
  let exists;
  do {
    const randomNum = Math.floor(100000000000 + Math.random() * 900000000000);
    cardNumber = '4000' + randomNum.toString();
    exists = await Card.findOne({ number: cardNumber });
  } while (exists);
  return cardNumber;
};

const generateRandomPassword = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const generateCVV = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

const generateExpiry = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}`;
};

const createCard = async (req, res) => {
  try {
    const { fullName, cpf, rg, address, cardPassword } = req.body;
    const userId = req.user.id;

    if (!fullName || !cpf || !rg || !cardPassword) {
      return res.status(400).json({ error: 'Nome, CPF, RG e senha são obrigatórios' });
    }
    if (!/^\d{11}$/.test(cpf)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }
    if (!/^\d{7,9}$/.test(rg)) {
      return res.status(400).json({ error: 'RG inválido' });
    }

    const user = await User.findById(userId).select('email');
    const email = req.body.email || (user ? user.email : null);
    if (email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    const existingCard = await Card.findOne({ cpf });
    if (existingCard) {
      return res.status(400).json({ error: 'Já existe um cartão associado a esse CPF' });
    }

    const cardNumber = await generateCardNumber();
    const card = new Card({
      userId,
      fullName,
      email,
      rg,
      cpf,
      address,
      cardPassword,
      number: cardNumber,
      lastFour: cardNumber.slice(-4),
      cvv: generateCVV(),
      expiry: generateExpiry(),
      limit: 5000,
      type: 'physical',
      virtualType: 'multi-use',
    });

    await card.save();
    res.status(201).json({
      message: 'Cartão criado com sucesso',
      card: { number: card.number, type: card.type, status: card.status },
    });
  } catch (error) {
    console.error('Erro ao criar cartão:', error.stack);
    res.status(500).json({ error: `Erro ao criar cartão: ${error.message}` });
  }
};

const createVirtualCard = async (req, res) => {
  try {
    const { cardName, virtualType } = req.body;
    if (!cardName) {
      return res.status(400).json({ error: 'Nome no cartão é obrigatório' });
    }
    if (!['single-use', 'multi-use'].includes(virtualType)) {
      return res.status(400).json({ error: 'Tipo de cartão virtual inválido' });
    }

    const user = await User.findById(req.user.id);
    const cardNumber = await generateCardNumber();
    const card = new Card({
      userId: req.user.id,
      fullName: cardName,
      email: user.email,
      cpf: user.cpf,
      cardPassword: generateRandomPassword(),
      number: cardNumber,
      lastFour: cardNumber.slice(-4),
      cvv: generateCVV(),
      expiry: generateExpiry(),
      limit: 1000,
      type: 'virtual',
      virtualType,
      status: 'active',
    });

    await card.save();
    res.status(201).json({
      message: 'Cartão virtual criado com sucesso',
      card: { number: card.number, type: card.type, status: card.status },
    });
  } catch (error) {
    console.error('Erro ao criar cartão virtual:', error.stack);
    res.status(500).json({ error: `Erro ao criar cartão virtual: ${error.message}` });
  }
};

const replacePhysicalCard = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Motivo é obrigatório' });
    }

    const cardRequest = new CardRequest({
      userId: req.user.id,
      reason,
    });

    await cardRequest.save();
    res.json({ message: 'Solicitação de novo cartão registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao solicitar novo cartão:', error.stack);
    res.status(500).json({ error: `Erro ao solicitar novo cartão: ${error.message}` });
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
    res.status(500).json({ error: `Erro ao ativar cartão: ${error.message}` });
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
    res.status(500).json({ error: `Erro ao desbloquear cartão: ${error.message}` });
  }
};

const getCards = async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id }).select('number type status _id');
    res.json(cards);
  } catch (error) {
    console.error('Erro ao buscar cartões:', error.stack);
    res.status(500).json({ error: `Erro ao buscar cartões: ${error.message}` });
  }
};

module.exports = {
  createCard,
  createVirtualCard,
  replacePhysicalCard,
  activateCard,
  unlockCard,
  getCards,
};