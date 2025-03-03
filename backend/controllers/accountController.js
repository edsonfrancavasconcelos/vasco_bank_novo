const bcrypt = require("bcrypt");
const Account = require("./models/Accounts"); // Certifique-se de que o caminho está correto
const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const User = require("../models/User");

router.post("/create", async (req, res) => {
  try {
    const { userId } = req.body;

    // Verifica se o usuário existe
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const numeroConta = Math.floor(100000 + Math.random() * 900000).toString(); // Gera um número de conta aleatório

    const novaConta = new Account({ numeroConta, saldo: 0, userId });
    await novaConta.save();

    res
      .status(201)
      .json({ message: "Conta criada com sucesso", conta: novaConta });
  } catch (error) {
    res.status(500).json({ message: "Erro ao criar conta", error });
  }
});

module.exports = router;

// Função para validar CPF
function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos
  if (cpf.length !== 11) return false; // Verifica se tem 11 dígitos
  if (/^(\d)\1{10}$/.test(cpf)) return false; // Verifica se todos os números são iguais

  // Função para calcular os dígitos verificadores
  function calculateCheckDigit(cpf, factor) {
    let total = 0;
    for (let i = 0; i < factor - 1; i++) {
      total += parseInt(cpf.charAt(i)) * (factor - i);
    }
    let remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  // Calcula os dois dígitos verificadores
  const digit1 = calculateCheckDigit(cpf, 10);
  const digit2 = calculateCheckDigit(cpf, 11);

  // Verifica se os dígitos calculados batem com os dígitos verificadores fornecidos
  return (
    digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10))
  );
}

exports.createAccount = async (req, res) => {
  try {
    const { fullName, cpf, email, password, phone } = req.body;

    // Validação dos dados de entrada
    if (!fullName || !cpf || !email || !password || !phone) {
      return res.status(400).json({
        error: "Nome completo, CPF, email, senha e telefone são obrigatórios.",
      });
    }

    // Validação de CPF
    if (!validateCPF(cpf)) {
      return res.status(400).json({
        error: "CPF inválido. Por favor, insira um CPF válido.",
      });
    }

    // Verificar se o CPF já existe
    const existingCpf = await Account.findOne({ cpf });
    if (existingCpf) {
      return res.status(400).json({
        error: "Já existe uma conta com esse CPF.",
      });
    }

    // Verificar se o número de telefone já existe
    const existingPhone = await Account.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        error: "Já existe uma conta com esse número de telefone.",
      });
    }

    // Verificar se o email já existe
    const existingEmail = await Account.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        error: "Já existe uma conta com esse email.",
      });
    }

    // Criptografar a senha antes de salvar a conta
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Gerar número da conta
    const accountNumber = Math.floor(100000 + Math.random() * 900000); // Gera número da conta aleatório

    // Criar uma nova instância de conta
    const newAccount = new Account({
      fullName,
      cpf,
      email,
      password: hashedPassword, // Armazena a senha criptografada
      phone,
      accountNumber,
    });

    // Salvar a nova conta no banco de dados
    await newAccount.save();

    res.status(201).json({
      message: "Conta criada com sucesso.",
      accountNumber: newAccount.accountNumber,
    });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar conta. Tente novamente.",
      errorDetails: error.message,
    });
  }
};
