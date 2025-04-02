// backend/controllers/userController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const registerUser = async (req, res) => {
    try {
        const { fullName, email, cpf, rg, address, password, pixKeys, initialBalance } = req.body;
        console.log("Dados recebidos no backend:", req.body);

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "Usuário já existe" });
        }

        const cpfExists = await User.findOne({ cpf });
        if (cpfExists) {
            return res.status(400).json({ error: "CPF já registrado" });
        }

        // Valida duplicatas de pixKeys
        if (pixKeys && pixKeys.length > 0) {
            const pixKeyValues = pixKeys.map(p => p.key);
            const existingPixKeys = await User.find({ "pixKeys.key": { $in: pixKeyValues } });
            if (existingPixKeys.length > 0) {
                const duplicateKeys = existingPixKeys.map(u => u.pixKeys.find(pk => pixKeyValues.includes(pk.key)).key);
                console.log("Chaves Pix duplicadas:", duplicateKeys);
                return res.status(400).json({ error: `Chave(s) Pix já cadastrada(s): ${duplicateKeys.join(", ")}` });
            }
        }

        const user = new User({
            fullName,
            email,
            cpf,
            rg,
            address,
            password, // O pre-save hasheia
            accountNumber: `ACC${Math.floor(100000 + Math.random() * 900000)}`,
            pixKeys: pixKeys || [], // Array de chaves Pix, pode ser vazio
            balance: initialBalance || 0,
        });

        console.log("Dados antes de salvar:", user);
        await user.save();
        console.log("Usuário salvo:", user);

        const token = jwt.sign(
            { id: user._id, accountNumber: user.accountNumber },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(201).json({ token, accountNumber: user.accountNumber });
    } catch (error) {
        console.error("Erro detalhado ao registrar usuário:", error.stack);
        if (error.code === 11000 && error.keyPattern["pixKeys.key"]) {
            return res.status(400).json({ error: "Chave Pix já cadastrada" });
        }
        res.status(500).json({ error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Dados recebidos no login:", { email, password });

        const user = await User.findOne({ email });
        if (!user) {
            console.log("Usuário não encontrado:", email);
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        console.log("Senha no banco:", user.password);
        const isMatch = await user.comparePassword(password);
        console.log("Senha válida?", isMatch);

        if (!isMatch) {
            console.log("Senha inválida para:", email);
            return res.status(401).json({ error: "Senha inválida" });
        }

        const token = jwt.sign(
            { id: user._id, accountNumber: user.accountNumber },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ token });
    } catch (error) {
        console.error("Erro ao fazer login:", error.stack);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
};

const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao buscar info do usuário:", error.stack);
        res.status(500).json({ error: "Erro ao buscar informações" });
    }
};

const getUserByAccountNumber = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const user = await User.findOne({ accountNumber }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "Conta não encontrada" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao buscar usuário por conta:", error.stack);
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
};

const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({
            $or: [{ fromAccount: userId }, { targetAccount: userId }],
        }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Erro ao buscar histórico:", error.stack);
        res.status(500).json({ error: "Erro ao carregar histórico" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserInfo,
    getUserByAccountNumber,
    getTransactionHistory,
};