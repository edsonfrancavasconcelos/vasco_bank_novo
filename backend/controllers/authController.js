const User = require("../models/User"); // Ajusta o caminho pro teu model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Função de login
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Verifica se os campos obrigatórios foram enviados
    if (!identifier || !password) {
      return res.status(400).json({
        message: "⚠️ Identificador e senha são obrigatórios!",
      });
    }

    // Busca o usuário por CPF, número da conta ou email
    const user = await User.findOne({
      $or: [
        { cpf: identifier },
        { accountNumber: identifier },
        { email: identifier },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "⚠️ Identificador inválido!",
      });
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "⚠️ Senha incorreta!",
      });
    }

    // Verifica se JWT_SECRET está configurado
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não está configurado no ambiente.");
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id: user._id,
        cpf: user.cpf,
        accountNumber: user.accountNumber,
        email: user.email,
      },
      secret,
      { expiresIn: "1h" }
    );

    console.log('Token gerado com payload:', {
      id: user._id,
      cpf: user.cpf,
      accountNumber: user.accountNumber,
      email: user.email,
    });

    // Responde com sucesso
    res.status(200).json({
      success: true,
      message: "✅ Login realizado com sucesso!",
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        cpf: user.cpf,
        accountNumber: user.accountNumber,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao fazer login:", error.stack);
    res.status(500).json({
      message: "❌ Erro interno do servidor",
      error: error.message,
    });
  }
};

// Função de registro (opcional, caso precise)
const register = async (req, res) => {
  try {
    const { fullName, email, cpf, accountNumber, password } = req.body;

    // Verifica se todos os campos obrigatórios foram enviados
    if (!fullName || !email || !cpf || !accountNumber || !password) {
      return res.status(400).json({
        message: "⚠️ Todos os campos são obrigatórios!",
      });
    }

    // Verifica se o usuário já existe (por email, cpf ou accountNumber)
    const existingUser = await User.findOne({
      $or: [{ email }, { cpf }, { accountNumber }],
    });
    if (existingUser) {
      return res.status(400).json({
        message: "⚠️ Usuário já registrado com esse email, CPF ou número de conta!",
      });
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria o novo usuário
    const user = new User({
      fullName,
      email,
      cpf,
      accountNumber,
      password: hashedPassword,
      balance: 0, // Saldo inicial, ajusta se precisar
    });

    await user.save();

    // Gera o token JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não está configurado no ambiente.");
    }

    const token = jwt.sign(
      {
        id: user._id,
        cpf: user.cpf,
        accountNumber: user.accountNumber,
        email: user.email,
      },
      secret,
      { expiresIn: "1h" }
    );

    console.log('Novo usuário registrado e token gerado:', {
      id: user._id,
      cpf: user.cpf,
      accountNumber: user.accountNumber,
      email: user.email,
    });

    // Responde com sucesso
    res.status(201).json({
      success: true,
      message: "✅ Usuário registrado com sucesso!",
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        cpf: user.cpf,
        accountNumber: user.accountNumber,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao registrar usuário:", error.stack);
    res.status(500).json({
      message: "❌ Erro interno do servidor",
      error: error.message,
    });
  }
};

// Função pra validar o token (opcional, pra checar se o usuário tá autenticado)
const checkAuth = async (req, res) => {
  try {
    // O req.user já vem populado pelo authMiddleware
    res.status(200).json({
      success: true,
      message: "✅ Usuário autenticado!",
      user: {
        id: req.user.id,
        accountNumber: req.user.accountNumber,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao verificar autenticação:", error.stack);
    res.status(500).json({
      message: "❌ Erro interno do servidor",
      error: error.message,
    });
  }
};

module.exports = { login, register, checkAuth };