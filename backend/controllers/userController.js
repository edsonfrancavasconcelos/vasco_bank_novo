// backend/controllers/userController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Registro de usuário
async function registerUser(req, res) {
  const { fullName, email, cpf, rg, address, password, initialBalance } =
    req.body;

  try {
    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ $or: [{ email }, { cpf }] });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail ou CPF já registrado" });
    }

    // Gera hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Gera número da conta único
    const accountNumber = `VB${Math.floor(100000 + Math.random() * 900000)}`;

    // Cria novo usuário
    const user = new User({
      fullName,
      email,
      cpf,
      rg,
      address,
      password: hashedPassword,
      accountNumber,
      balance: initialBalance || 0,
    });

    // Salva no MongoDB
    await user.save();
    console.log("Usuário registrado:", { fullName, accountNumber });

    // Gera token JWT
    const token = jwt.sign(
      { id: user._id }, // Ajustei para "id" em vez de "_id" para consistência com authenticateToken
      process.env.JWT_SECRET || "sua-chave-secreta-aqui",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      token,
      accountNumber,
    });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
}

// Login de usuário
async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "sua-chave-secreta-aqui",
      { expiresIn: "1h" }
    );

    console.log("Login bem-sucedido:", { email });
    res.json({ message: "Login bem-sucedido", token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
}

// Informações do usuário logado
async function getUserInfo(req, res) {
  try {
    const user = await User.findById(req.user.id); // req.user.id vem do token
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const userData = {
      fullName: user.fullName,
      accountNumber: user.accountNumber,
      balance: user.balance,
    };
    console.log("Dados enviados para o frontend:", userData);
    res.json(userData);
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    res.status(500).json({ error: "Erro ao buscar informações do usuário" });
  }
}

// Buscar usuário por número da conta
async function getUserByAccountNumber(req, res) {
  try {
    const user = await User.findOne({
      accountNumber: req.params.accountNumber,
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({ fullName: user.fullName });
  } catch (error) {
    console.error("Erro ao buscar usuário por accountNumber:", error);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
  getUserByAccountNumber,
};
