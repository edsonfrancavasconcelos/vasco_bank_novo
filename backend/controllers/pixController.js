const User = require("../models/User");
const Transaction = require("../models/Transaction");
const PixLimit = require("../models/PixLimit");

exports.transfer = async (req, res) => {
    const { key, amount } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        if (user.balance < amount) return res.status(400).json({ error: "Saldo insuficiente" });

        const pixLimit = await PixLimit.findOne({ userId: req.user.id });
        if (pixLimit && amount > pixLimit.dailyLimit) return res.status(400).json({ error: "Excede limite Pix" });

        user.balance -= amount;
        await user.save();

        const transaction = new Transaction({
            userId: req.user.id,
            type: "pix_transfer",
            amount: -amount,
            details: { key },
        });
        await transaction.save();

        res.json({ message: "Transferência realizada" });
    } catch (error) {
        console.error("Erro na transferência Pix:", error);
        res.status(500).json({ error: "Erro interno" });
    }
};

exports.schedule = async (req, res) => {
    const { key, amount, date } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

        const transaction = new Transaction({
            userId: req.user.id,
            type: "pix_scheduled",
            amount: -amount,
            details: { key, scheduledDate: date },
        });
        await transaction.save();
        res.json({ message: "Pix programado" });
    } catch (error) {
        console.error("Erro ao programar Pix:", error);
        res.status(500).json({ error: "Erro interno" });
    }
};

exports.copiaecola = async (req, res) => {
    const { code } = req.body;
    try {
        const transaction = new Transaction({
            userId: req.user.id,
            type: "pix_copiaecola",
            amount: 0,
            details: { code },
        });
        await transaction.save();
        res.json({ message: "Copia e Cola processado" });
    } catch (error) {
        console.error("Erro no Copia e Cola:", error);
        res.status(500).json({ error: "Erro interno" });
    }
};

exports.charge = async (req, res) => {
    const { amount } = req.body;
    try {
        const transaction = new Transaction({
            userId: req.user.id,
            type: "pix_charge",
            amount,
            details: { status: "pending" },
        });
        await transaction.save();
        res.json({ message: "Cobrança criada" });
    } catch (error) {
        console.error("Erro ao criar cobrança:", error);
        res.status(500).json({ error: "Erro interno" });
    }
};

exports.deposit = async (req, res) => {
    const { amount } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        user.balance += amount;
        await user.save();

        const transaction = new Transaction({
            userId: req.user.id,
            type: "pix_deposit",
            amount,
        });
        await transaction.save();
        res.json({ message: "Depósito realizado" });
    } catch (error) {
        console.error("Erro no depósito:", error);
        res.status(500).json({ error: "Erro interno" });
    }
};

exports.setLimit = async (req, res) => {
    const { limit } = req.body;
    try {
        let pixLimit = await PixLimit.findOne({ userId: req.user.id });
        if (!pixLimit) {
            pixLimit = new PixLimit({ userId: req.user.id, dailyLimit: limit });
        } else {
            pixLimit.dailyLimit = limit;
        }
        await pixLimit.save();
        res.json({ message: "Limite Pix atualizado" });
    } catch (error) {
        console.error("Erro ao definir limite Pix:", error);
        res.status(500).json({ error: "Erro interno" });
    }
};

exports.getKeys = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        res.json({ keys: user.pixKeys || [] });
    } catch (error) {
        console.error("Erro ao listar chaves Pix:", error);
        res.status(500).json({ error: "Erro interno" });
    }
};