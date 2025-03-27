const Card = require("../models/Card");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const generateCardNumber = () => {
  return "VC" + crypto.randomBytes(4).toString("hex").toUpperCase();
};

const createCard = async (req, res) => {
  const { fullName, rg, cpf, address, cardPassword, cardType } = req.body;

  if (!fullName || !rg || !cpf || !address || !cardPassword) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const card = new Card({
      userId: req.user._id, // Vem do authMiddleware
      fullName,
      rg,
      cpf,
      address,
      cardPassword: await bcrypt.hash(cardPassword, 10),
      cardType: cardType || "debit",
      cardNumber: generateCardNumber(),
    });

    await card.save();

    const transaction = new Transaction({
      userId: req.user._id,
      type: "card_creation",
      amount: 0,
      description: `Cartão ${cardType || "debit"} criado - ${card.cardNumber}`,
    });
    await transaction.save();

    res.status(201).json({
      message: "Cartão criado com sucesso!",
      cardNumber: card.cardNumber,
    });
  } catch (error) {
    console.error("Erro ao criar cartão:", error);
    res.status(500).json({ error: "Erro ao criar cartão." });
  }
};

module.exports = { createCard };
