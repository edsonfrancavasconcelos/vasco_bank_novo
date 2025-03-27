const Account = require("../models/Account");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Função para criar uma conta
exports.createAccount = async (req, res) => {
  try {
    const { cpf, email, password } = req.body;

    // Validação dos campos obrigatórios
    if (!cpf || !email || !password) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    }

    // Verifica se o CPF ou e-mail já estão cadastrados
    const existingAccount = await Account.findOne({
      $or: [{ cpf }, { email }],
    });
    if (existingAccount) {
      return res.status(400).json({ error: "CPF ou e-mail já cadastrados." });
    }

    // Hash da senha antes de salvar no banco de dados
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria a nova conta
    const account = new Account({ cpf, email, password: hashedPassword });
    await account.save();

    res.status(201).json({ message: "Conta criada com sucesso", account });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    res.status(500).json({ error: "Erro interno ao criar conta." });
  }
};

// Função para fazer login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação dos campos obrigatórios
    if (!email || !password) {
      return res.status(400).json({
        message: "⚠️ E-mail e senha são obrigatórios!",
      });
    }

    // Busca a conta pelo e-mail
    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(401).json({
        message: "⚠️ E-mail ou senha inválidos!",
      });
    }

    // Compara a senha fornecida com a senha hasheada no banco de dados
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "⚠️ Senha incorreta!",
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: account._id, cpf: account.cpf, email: account.email },
      process.env.JWT_SECRET || "sua-chave-secreta-aqui",
      { expiresIn: "1h" }
    );

    // Resposta de sucesso
    res.status(200).json({
      success: true,
      message: "✅ Login realizado com sucesso!",
      token,
      account: {
        email: account.email,
        cpf: account.cpf,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao fazer login:", error);
    res.status(500).json({
      message: "❌ Erro interno do servidor",
      error: error.message,
    });
  }
};
