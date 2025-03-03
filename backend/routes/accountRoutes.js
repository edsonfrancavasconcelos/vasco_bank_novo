const express = require("express");
const Account = require("../models/Account");
const router = express.Router();

// Rota para criar uma nova conta
router.post("/", async (req, res) => {
  console.log("Recebendo requisição de criação de conta:", req.body);

  const { fullName, email, cpf, password, phone } = req.body;

  // Verifica se todos os campos foram preenchidos
  if (!fullName || !email || !cpf || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: "Preencha todos os campos!",
    });
  }

  try {
    // Verifica se o e-mail, CPF ou telefone já existem
    const existingAccount = await Account.findOne({
      $or: [{ email }, { cpf }, { phone }],
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "E-mail, CPF ou número de telefone já cadastrado.",
      });
    }

    // Cria a conta
    const newAccount = new Account({ fullName, email, cpf, password, phone });
    await newAccount.save();

    res.status(201).json({
      success: true,
      message: "Conta criada com sucesso!",
      accountNumber: newAccount.accountNumber,
    });
  } catch (error) {
    console.error("Erro ao criar conta:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro ao criar conta. Tente novamente.",
      error: error.message,
    });
  }
});

/// Rota para acessar a conta pelo CPF
router.get("/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;

    // Valida o CPF (opcional, mas recomendado)
    if (!/^\d{11}$/.test(cpf)) {
      // Expressão regular simples para validar formato do CPF
      return res.status(400).json({
        success: false,
        message: "CPF inválido.",
      });
    }

    const account = await Account.findOne({ cpf });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Conta não encontrada.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conta encontrada!",
      account: {
        nome: account.fullName,
        cpf: account.cpf,
        saldo: account.saldo || 0,
        transacoes: account.transacoes || [],
        // ... outros dados que você precisa retornar
      },
    });
  } catch (error) {
    console.error("Erro ao acessar a conta:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro ao acessar a conta.",
    });
  }
});

module.exports = router;
