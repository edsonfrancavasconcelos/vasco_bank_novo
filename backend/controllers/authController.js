const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

module.exports = { login };
