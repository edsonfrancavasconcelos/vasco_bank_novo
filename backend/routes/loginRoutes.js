const Account = require("../models/Account"); // Importe o model Account
const bcrypt = require("bcrypt"); // Importe o bcrypt para comparar senhas
const jwt = require("jsonwebtoken"); // Importe o jsonwebtoken para gerar tokens JWT

exports.login = async (req, res) => {
  try {
    const { cpf, email, password } = req.body; // Obtenha email e senha do corpo da requisição

    // Validação básica (opcional, mas recomendado)
    if (!email || !password) {
      return res.status(400).json({ error: "CPF e senha são obrigatórios." });
    }

    // Encontrar a conta pelo email
    const account = await Account.findOne({ cpf }); // Busca por CPF

    if (!account) {
      return res.status(400).json({ error: "CPF ou senha inválidos." });
    }

    // Verificar a senha
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.status(400).json({ error: "CPF ou senha inválidos." });
    }

    // Gerar um token JWT (se aplicável)
    const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Defina o tempo de expiração do token
    });
    eu;

    res.json({ message: "Login bem-sucedido", token }); // Envie o token na resposta
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login." });
  }
};
