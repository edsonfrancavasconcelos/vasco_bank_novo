// backend/routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Card = require("../models/Card");
const Loan = require("../models/Loan");
const authMiddleware = require("../middleware/authMiddleware");
const { transferMoney } = require("../controllers/transactionController");

// Histórico de transações
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ transactions });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error.message);
    res.status(500).json({ error: "Erro ao buscar histórico de transações" });
  }
});

// Saque 
router.post("/withdraw", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    const fromAccount = req.user.accountNumber;
  
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valor de saque inválido" });
    }
  
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
  
      const user = await User.findOne({ accountNumber: fromAccount }).session(session);
      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      if (user.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Saldo insuficiente" });
      }
  
      user.balance -= parseFloat(amount);
      await user.save({ session });
  
      const transaction = new Transaction({
        type: "withdraw",
        amount,
        fromAccount,
        targetAccount: fromAccount,
        description: "Saque",
        userId: req.user.id,
        date: new Date()
      });
      await transaction.save({ session });
  
      await session.commitTransaction();
      res.json({ message: "Saque realizado com sucesso", balance: user.balance });
    } catch (error) {
      await session.abortTransaction();
      console.error("Erro no saque:", error.message);
      res.status(500).json({ error: "Erro ao processar saque" });
    } finally {
      session.endSession();
    }
  });
  

//Deposito
router.post("/deposit", authMiddleware, async (req, res) => {
    const { amount } = req.body;
    const fromAccount = req.user.accountNumber;
  
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valor de depósito inválido" });
    }
  
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
  
      const user = await User.findOne({ accountNumber: fromAccount }).session(session);
      if (!user) {
        await session.abortTransaction();
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      user.balance += parseFloat(amount);
      await user.save({ session });
  
      const transaction = new Transaction({
        type: "deposit",
        amount,
        fromAccount,
        targetAccount: fromAccount,
        description: "Depósito",
        userId: req.user.id,
        date: new Date()
      });
      await transaction.save({ session });
  
      await session.commitTransaction();
      res.json({ message: "Depósito realizado com sucesso", balance: user.balance });
    } catch (error) {
      await session.abortTransaction();
      console.error("Erro no depósito:", error.message);
      res.status(500).json({ error: "Erro ao processar depósito" });
    } finally {
      session.endSession();
    }
  });
  

// Dados financeiros
router.get("/financial", authMiddleware, async (req, res) => {
  try {
    const card = await Card.findOne({ userId: req.user.id }) || { invoice: 0 };
    const loans = await Loan.find({ userId: req.user.id });
    res.json({
      card: { invoice: card.invoice || 0 },
      loans: loans.map(l => ({ amount: l.amount, installments: l.installments })),
      consigned: []
    });
  } catch (error) {
    console.error("Erro ao buscar dados financeiros:", error.message);
    res.status(500).json({ error: "Erro ao buscar dados financeiros" });
  }
});

// Transferência
router.post("/transfer", authMiddleware, async (req, res) => {
  const { accountNumber, amount } = req.body;
  const fromAccount = req.user?.accountNumber;

  if (!req.user) return res.status(401).json({ error: "Usuário não autenticado" });
  if (!accountNumber || !amount || isNaN(amount) || amount <= 0)
    return res.status(400).json({ error: "Número da conta destino e valor válido são obrigatórios" });

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const sender = await User.findOne({ accountNumber: fromAccount }).session(session);
    const receiver = await User.findOne({ accountNumber }).session(session);

    if (!sender || !receiver) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Conta não encontrada" });
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
      type: "transfer",
      amount,
      fromAccount,
      targetAccount: accountNumber,
      description: "Transferência",
      userId: req.user.id,
      date: new Date()
    });

    await transaction.save({ session });
    await session.commitTransaction();

    res.json({ message: "Transferência realizada com sucesso", balance: sender.balance });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erro na transferência:", error.message);
    res.status(500).json({ error: "Erro ao processar transferência" });
  } finally {
    session.endSession();
  }
});

// Recarga de celular
router.post("/recharge", authMiddleware, async (req, res) => {
  const { phoneNumber, amount } = req.body;
  const fromAccount = req.user.accountNumber;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const user = await User.findOne({ accountNumber: fromAccount }).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    if (user.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    user.balance -= amount;
    await user.save({ session });

    const transaction = new Transaction({
      type: "recharge",
      amount,
      fromAccount,
      targetAccount: phoneNumber,
      description: "Recarga de celular",
      userId: req.user.id,
      date: new Date()
    });

    await transaction.save({ session });
    await session.commitTransaction();

    res.json({ message: "Recarga realizada com sucesso", balance: user.balance });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erro na recarga:", error.message);
    res.status(500).json({ error: "Erro ao processar recarga" });
  } finally {
    session.endSession();
  }
});

// Pagamento de boleto
router.post("/bill/pay", authMiddleware, async (req, res) => {
  const { barcode, amount } = req.body;
  const fromAccount = req.user.accountNumber;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const user = await User.findOne({ accountNumber: fromAccount }).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    if (user.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    user.balance -= amount;
    await user.save({ session });

    const transaction = new Transaction({
      type: "bill",
      amount,
      fromAccount,
      targetAccount: barcode,
      description: "Pagamento de boleto",
      userId: req.user.id,
      date: new Date()
    });

    await transaction.save({ session });
    await session.commitTransaction();

    res.json({ message: "Pagamento de boleto realizado com sucesso", balance: user.balance });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erro no pagamento de boleto:", error.message);
    res.status(500).json({ error: "Erro ao processar pagamento de boleto" });
  } finally {
    session.endSession();
  }
});

module.exports = router;
