const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Registro de usuário
const registerUser = async (req, res) => {
    try {
        const { fullName, email, cpf, rg, address, password, initialBalance } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { cpf }] });
        if (existingUser) {
            return res.status(400).json({ error: "E-mail ou CPF já registrado" });
        }

        const accountNumber = "VB" + Math.floor(100000 + Math.random() * 900000);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email,
            cpf,
            rg,
            address,
            password: hashedPassword,
            balance: initialBalance || 0,
            accountNumber,
        });
        await user.save();

        const response = { message: "Usuário registrado com sucesso", accountNumber };
        console.log("Resposta enviada ao frontend:", response); // Log pra debug
        res.status(201).json(response);
    } catch (error) {
        console.error("Erro ao registrar:", error.message);
        res.status(400).json({ error: "Erro ao registrar usuário" });
    }
};

// Login de usuário
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }
        if (!(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Senha inválida" });
        }
        const token = jwt.sign(
            { id: user._id, accountNumber: user.accountNumber },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ token });
    } catch (error) {
        console.error("Erro ao fazer login:", error.message);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
};

// Info do usuário logado
const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        res.status(200).json({
            fullName: user.fullName,
            accountNumber: user.accountNumber,
            balance: user.balance,
        });
    } catch (error) {
        console.error("Erro ao buscar info:", error.message);
        res.status(500).json({ error: "Erro ao buscar dados do usuário" });
    }
};

// Busca por número da conta
const getUserByAccountNumber = async (req, res) => {
    try {
        const { accountNumber } = req.params;
        const user = await User.findOne({ accountNumber });
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        res.status(200).json({ fullName: user.fullName });
    } catch (error) {
        console.error("Erro ao buscar por conta:", error.message);
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserInfo,
    getUserByAccountNumber,
};