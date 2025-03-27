const Account = require("../models/Account");
const bcrypt = require("bcrypt");

exports.createAccount = async (req, res) => {
  try {
    const { fullName, cpf, email, password, phone } = req.body;

    // Validação dos dados de entrada
    if (!fullName || !cpf || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: "Nome completo, CPF, email, senha e telefone são obrigatórios.",
      });
    }

    // Verificar se o CPF já existe
    const existingCpf = await Account.findOne({ cpf });
    if (existingCpf) {
      return res.status(400).json({
        success: false,
        error: "Já existe uma conta com esse CPF.",
      });
    }

    // Verificar se o número de telefone já existe
    const existingPhone = await Account.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: "Já existe uma conta com esse número de telefone.",
      });
    }

    // Verificar se o email já existe
    const existingEmail = await Account.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Já existe uma conta com esse email.",
      });
    }

    // Criptografar a senha antes de salvar
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Gerar número da conta (6 dígitos aleatórios)
    const accountNumber = Math.floor(100000 + Math.random() * 900000);

    // Criar uma nova instância de conta
    const newAccount = new Account({
      fullName,
      cpf,
      email,
      password: hashedPassword, // Armazena a senha criptografada
      phone,
      accountNumber,
    });

    const createResponse = await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, cpf, email, password, phone }),
    });

    // Salvar a nova conta no banco de dados
    const savedAccount = await newAccount.save(); // Salve a conta primeiro

    // Verifique se a conta foi salva corretamente
    if (!savedAccount) {
      return res.status(500).json({
        success: false,
        error: "Erro ao salvar a conta no banco de dados.",
      });
    }

    // Se a conta foi salva corretamente, retornamos a resposta
    res.status(201).json({
      success: true,
      message: "Conta criada com sucesso.",
      accountNumber: savedAccount.accountNumber, // Agora temos certeza que esse campo existe
    });
  } catch (error) {
    console.error("Erro ao criar conta:", error); // Depuração
    res.status(500).json({
      success: false,
      message: "Erro ao criar conta. Tente novamente.",
      errorDetails: error.message,
    });
  }
};
