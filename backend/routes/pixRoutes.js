// backend/routes/pixRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// Transferência PIX
const transferPix = async (req, res) => {
  const { pixKey, amount } = req.body;
  const fromAccount = req.user.accountNumber;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const sender = await User.findOne({ accountNumber: fromAccount }).session(session);
    const receiver = await User.findOne({ "pixKeys.key": pixKey }).session(session);
    if (!sender || !receiver) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Conta ou chave PIX não encontrada" });
    }
    if (sender.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Saldo insuficiente" });
    }
    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save({ session });
    await receiver.save({ session });
    const transaction = new Transaction({
      type: "pix/transfer",
      amount,
      fromAccount,
      targetAccount: receiver.accountNumber,
      description: "PIX Transferência",
      userId: req.user.id,
      date: new Date()
    });
    await transaction.save({ session });
    await session.commitTransaction();
    res.json({ message: "PIX Transferência realizada com sucesso", balance: sender.balance });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erro na PIX transferência:", error.message);
    res.status(500).json({ error: "Erro ao processar PIX transferência" });
  } finally {
    session.endSession();
  }
};

// Pagamento PIX
const payPix = async (req, res) => {
  const { pixKey, amount } = req.body;
  const fromAccount = req.user.accountNumber;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const sender = await User.findOne({ accountNumber: fromAccount }).session(session);
    if (!sender) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Conta não encontrada" });
    }
    if (sender.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Saldo insuficiente" });
    }
    sender.balance -= amount;
    await sender.save({ session });
    const transaction = new Transaction({
      type: "pix/pay",
      amount,
      fromAccount,
      targetAccount: pixKey,
      description: "Pagamento PIX",
      userId: req.user.id,
      date: new Date()
    });
    await transaction.save({ session });
    await session.commitTransaction();
    res.json({ message: "Pagamento PIX realizado com sucesso", balance: sender.balance });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erro no pagamento PIX:", error.message);
    res.status(500).json({ error: "Erro ao processar pagamento PIX" });
  } finally {
    session.endSession();
  }
};

// Cobrança PIX
const chargePix = async (req, res) => {
  const { amount, description } = req.body;
  const fromAccount = req.user.accountNumber;

  try {
    const transaction = new Transaction({
      type: "pix/charge",
      amount,
      fromAccount,
      targetAccount: "N/A",
      description: description || "Cobrança PIX",
      userId: req.user.id,
      date: new Date()
    });
    await transaction.save();
    res.json({ message: "Cobrança PIX criada com sucesso", transaction });
  } catch (error) {
    console.error("Erro na cobrança PIX:", error.message);
    res.status(500).json({ error: "Erro ao criar cobrança PIX" });
  }
};

// Agendamento PIX
const schedulePix = async (req, res) => {
  const { pixKey, amount, date } = req.body;
  const fromAccount = req.user.accountNumber;

  try {
    const transaction = new Transaction({
      type: "pix/schedule",
      amount,
      fromAccount,
      targetAccount: pixKey,
      description: "Agendamento PIX",
      userId: req.user.id,
      date: new Date(date)
    });
    await transaction.save();
    res.json({ message: "PIX agendado com sucesso", transaction });
  } catch (error) {
    console.error("Erro no agendamento PIX:", error.message);
    res.status(500).json({ error: "Erro ao agendar PIX" });
  }
};

// Registro de chave PIX
const registerPixKey = async (req, res) => {
  const { keyType, key } = req.body;
  const fromAccount = req.user.accountNumber;

  try {
    const user = await User.findOne({ accountNumber: fromAccount });
    if (!user) {
      return res.status(404).json({ error: "Conta não encontrada" });
    }
    user.pixKeys = user.pixKeys || [];
    user.pixKeys.push({ keyType, key });
    await user.save();
    res.json({ message: "Chave PIX registrada com sucesso", pixKeys: user.pixKeys });
  } catch (error) {
    console.error("Erro ao registrar chave PIX:", error.message);
    res.status(500).json({ error: "Erro ao registrar chave PIX" });
  }
};

// Rotas
router.post("/transfer", authMiddleware, transferPix);
router.post("/pay", authMiddleware, payPix);
router.post("/charge", authMiddleware, chargePix);
router.post("/schedule", authMiddleware, schedulePix);
router.post("/keys", authMiddleware, registerPixKey);

module.exports = router;