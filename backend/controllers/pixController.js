const User = require("../models/User");
const PixKey = require("../models/pixKey");
const Transaction = require("../models/Transaction");

const transferPix = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { key, amount } = req.body;
    if (!key || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Chave Pix e valor são obrigatórios" });
    }

    const user = await User.findById(req.user.id).session(session);
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    const recipientKey = await PixKey.findOne({ value: key }).session(session);
    if (!recipientKey) {
      return res.status(404).json({ error: "Chave Pix não encontrada" });
    }

    const recipient = await User.findById(recipientKey.userId).session(session);
    if (!recipient) {
      return res.status(404).json({ error: "Destinatário não encontrado" });
    }

    user.balance -= amount;
    recipient.balance += amount;

    const transaction = new Transaction({
      userId: req.user.id,
      type: "pix_transfer",
      amount,
      details: { key },
    });

    await Promise.all([
      user.save({ session }),
      recipient.save({ session }),
      transaction.save({ session }),
    ]);

    await session.commitTransaction();
    res.json({ message: "Transferência Pix realizada com sucesso" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erro ao transferir Pix:", error.stack);
    res.status(500).json({ error: "Erro ao realizar transferência Pix" });
  } finally {
    session.endSession();
  }
};

const payPix = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Código Pix obrigatório" });
    }

    // Simulação: validar código Pix
    const amount = 50; // Substituir por integração real
    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    user.balance -= amount;

    const transaction = new Transaction({
      userId: req.user.id,
      type: "pix_payment",
      amount,
      details: { code },
    });

    await Promise.all([user.save(), transaction.save()]);
    res.json({ message: "Pagamento Pix realizado com sucesso" });
  } catch (error) {
    console.error("Erro ao pagar Pix:", error.stack);
    res.status(500).json({ error: "Erro ao realizar pagamento Pix" });
  }
};

const chargePix = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valor inválido" });
    }

    // Simulação: gerar cobrança Pix
    res.json({
      message: "Cobrança Pix criada com sucesso",
      code: "PIX_CODE_123",
    });
  } catch (error) {
    console.error("Erro ao criar cobrança Pix:", error.stack);
    res.status(500).json({ error: "Erro ao criar cobrança Pix" });
  }
};

const schedulePix = async (req, res) => {
  try {
    const { key, amount, date } = req.body;
    if (!key || !amount || !date) {
      return res
        .status(400)
        .json({ error: "Chave Pix, valor e data são obrigatórios" });
    }

    // Simulação: agendar transferência
    const transaction = new Transaction({
      userId: req.user.id,
      type: "pix_scheduled",
      amount,
      details: { key, date },
    });

    await transaction.save();
    res.json({ message: "Transferência Pix agendada com sucesso" });
  } catch (error) {
    console.error("Erro ao agendar Pix:", error.stack);
    res.status(500).json({ error: "Erro ao agendar transferência Pix" });
  }
};

const registerPixKey = async (req, res) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) {
      return res
        .status(400)
        .json({ error: "Tipo e valor da chave são obrigatórios" });
    }

    const existingKey = await PixKey.findOne({ value });
    if (existingKey) {
      return res.status(400).json({ error: "Chave Pix já registrada" });
    }

    const pixKey = new PixKey({
      userId: req.user.id,
      type,
      value,
    });

    await pixKey.save();
    res.json({ message: "Chave Pix registrada com sucesso" });
  } catch (error) {
    console.error("Erro ao registrar chave Pix:", error.stack);
    res.status(500).json({ error: "Erro ao registrar chave Pix" });
  }
};

module.exports = {
  transferPix,
  payPix,
  chargePix,
  schedulePix,
  registerPixKey,
};
