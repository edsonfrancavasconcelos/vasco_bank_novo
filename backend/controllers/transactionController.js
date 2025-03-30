// Data: 26 de Março de 2025, 19:00 - Nome: transactionController.js
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// Transferência
async function transfer(req, res) {
  const { toAccount, amount, description } = req.body;
  const userId = req.user?.id;

  console.log(
    "Transferência - userId:",
    userId,
    "toAccount:",
    toAccount,
    "amount:",
    amount
  );

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const sender = await User.findById(userId);
    if (!sender) {
      console.error("Sender não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta remetente não encontrada" });
    }

    const receiver = await User.findOne({ accountNumber: toAccount });
    if (!receiver) {
      console.error("Receiver não encontrado para accountNumber:", toAccount);
      return res
        .status(404)
        .json({ error: "Conta destinatária não encontrada" });
    }

    if (sender.balance < amount) {
      console.log("Saldo insuficiente - sender.balance:", sender.balance);
      return res.status(400).json({ error: "Saldo insuficiente" });
    }
    if (amount <= 0) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor deve ser maior que zero" });
    }

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    

    const transaction = new Transaction({
      type: "transfer",
      amount,
      fromAccount: sender.accountNumber,
      targetAccount: toAccount,
      description: description || "Transferência",
      userId,
    });
    await transaction.save();

    res.json({ message: "Transferência realizada", balance: sender.balance });
  } catch (error) {
    console.error("Erro na transferência:", error);
    res.status(500).json({ error: "Erro ao processar transferência" });
  }
}

// Depósito
async function deposit(req, res) {
  const { toAccount, amount } = req.body;
  const userId = req.user?.id;

  console.log(
    "Depósito - userId:",
    userId,
    "toAccount:",
    toAccount,
    "amount:",
    amount
  );

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const sender = await User.findById(userId);
    if (!sender) {
      console.error("Sender não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta remetente não encontrada" });
    }

    const receiver = await User.findOne({ accountNumber: toAccount });
    if (!receiver) {
      console.error("Receiver não encontrado para accountNumber:", toAccount);
      return res
        .status(404)
        .json({ error: "Conta destinatária não encontrada" });
    }

    if (amount <= 0) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor deve ser maior que zero" });
    }

    receiver.balance += amount;
    await receiver.save();

    const transaction = new Transaction({
      type: "deposit",
      amount,
      fromAccount: sender.accountNumber,
      targetAccount: toAccount,
      description: "Depósito",
      userId,
    });
    await transaction.save();

    res.json({ message: "Depósito realizado", balance: receiver.balance });
  } catch (error) {
    console.error("Erro no depósito:", error);
    res.status(500).json({ error: "Erro ao processar depósito" });
  }
}

// Saque
async function withdrawal(req, res) {
  const { amount } = req.body;
  const userId = req.user?.id;

  console.log("Saque - userId:", userId, "amount:", amount);

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuário não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    if (user.balance < amount) {
      console.log("Saldo insuficiente - user.balance:", user.balance);
      return res.status(400).json({ error: "Saldo insuficiente" });
    }
    if (amount <= 0) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor deve ser maior que zero" });
    }

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      type: "withdrawal",
      amount,
      fromAccount: user.accountNumber,
      targetAccount: null,
      description: "Saque",
      userId,
    });
    await transaction.save();

    res.json({ message: "Saque realizado", balance: user.balance });
  } catch (error) {
    console.error("Erro no saque:", error);
    res.status(500).json({ error: "Erro ao processar saque" });
  }
}

// Histórico
async function getHistory(req, res) {
  const userId = req.user?.id;

  console.log("Histórico - userId:", userId);

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const transactions = await Transaction.find({ userId });
    res.json(transactions.length > 0 ? transactions : []);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
}

// PIX Transferência
async function pixTransfer(req, res) {
  const { toAccount, amount, description } = req.body;
  const userId = req.user?.id;

  console.log(
    "PIX Transferência - userId:",
    userId,
    "toAccount:",
    toAccount,
    "amount:",
    amount
  );

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const sender = await User.findById(userId);
    if (!sender) {
      console.error("Sender não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta remetente não encontrada" });
    }

    const receiver = await User.findOne({ accountNumber: toAccount });
    if (!receiver) {
      console.error("Receiver não encontrado para accountNumber:", toAccount);
      return res
        .status(404)
        .json({ error: "Conta destinatária não encontrada" });
    }

    if (sender.balance < amount) {
      console.log("Saldo insuficiente - sender.balance:", sender.balance);
      return res.status(400).json({ error: "Saldo insuficiente" });
    }
    if (amount <= 0) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor deve ser maior que zero" });
    }

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    const transaction = new Transaction({
      type: "pix/transfer",
      amount,
      fromAccount: sender.accountNumber,
      targetAccount: toAccount,
      description: description || "PIX Transferência",
      userId,
    });
    await transaction.save();

    res.json({
      message: "PIX Transferência realizada",
      balance: sender.balance,
    });
  } catch (error) {
    console.error("Erro na PIX transferência:", error);
    res.status(500).json({ error: "Erro ao processar PIX transferência" });
  }
}

// PIX Pagamento
async function pixPayment(req, res) {
  const { targetKey, amount } = req.body;
  const userId = req.user?.id;

  console.log(
    "PIX Pagamento - userId:",
    userId,
    "targetKey:",
    targetKey,
    "amount:",
    amount
  );

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const sender = await User.findById(userId);
    if (!sender) {
      console.error("Sender não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta remetente não encontrada" });
    }

    const receiver = await User.findOne({ pixKey: targetKey });
    if (!receiver) {
      console.error("Receiver não encontrado para pixKey:", targetKey);
      return res.status(404).json({ error: "Chave PIX não encontrada" });
    }

    if (sender.balance < amount) {
      console.log("Saldo insuficiente - sender.balance:", sender.balance);
      return res.status(400).json({ error: "Saldo insuficiente" });
    }
    if (amount <= 0) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor deve ser maior que zero" });
    }

    sender.balance -= amount;
    receiver.balance += amount;
    await sender.save();
    await receiver.save();

    const transaction = new Transaction({
      type: "pix/payment",
      amount,
      fromAccount: sender.accountNumber,
      targetAccount: receiver.accountNumber,
      description: "PIX Pagamento",
      userId,
    });
    await transaction.save();

    res.json({ message: "PIX Pagamento realizado", balance: sender.balance });
  } catch (error) {
    console.error("Erro no PIX pagamento:", error);
    res.status(500).json({ error: "Erro ao processar PIX pagamento" });
  }
}

// PIX Recebimento
async function pixReceive(req, res) {
  const userId = req.user?.id;

  console.log("PIX Recebimento - userId:", userId);

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuário não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    const pixKey = user.pixKey || "Chave não registrada";
    res.json({ message: "Chave PIX para recebimento", pixKey });
  } catch (error) {
    console.error("Erro no PIX recebimento:", error);
    res.status(500).json({ error: "Erro ao consultar chave PIX" });
  }
}

// Recarga de Celular
async function recharge(req, res) {
  const { operator, phoneNumber, amount } = req.body;
  const userId = req.user?.id;
  const validOperators = ["Vivo", "Claro", "Tim", "Oi"];
  const validAmounts = [10, 20, 30, 50, 100];

  console.log(
    "Recarga - userId:",
    userId,
    "operator:",
    operator,
    "phoneNumber:",
    phoneNumber,
    "amount:",
    amount
  );

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    if (!validOperators.includes(operator)) {
      console.log("Operadora inválida - operator:", operator);
      return res.status(400).json({ error: "Operadora inválida" });
    }
    if (!validAmounts.includes(Number(amount))) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor de recarga inválido" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuário não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    if (user.balance < amount) {
      console.log("Saldo insuficiente - user.balance:", user.balance);
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      type: "recharge",
      amount,
      fromAccount: user.accountNumber,
      targetAccount: phoneNumber,
      description: `Recarga ${operator} - ${phoneNumber}`,
      userId,
    });
    await transaction.save();

    res.json({ message: "Recarga realizada", balance: user.balance });
  } catch (error) {
    console.error("Erro na recarga:", error);
    res.status(500).json({ error: "Erro ao processar recarga" });
  }
}

// PIX Registro
async function pixRegister(req, res) {
  const { pixKey } = req.body;
  const userId = req.user?.id;

  console.log("PIX Registro - userId:", userId, "pixKey:", pixKey);

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuário não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    const existingKey = await User.findOne({ pixKey });
    if (existingKey && existingKey._id.toString() !== userId) {
      console.log(
        "Chave PIX já registrada por outro usuário - pixKey:",
        pixKey
      );
      return res.status(400).json({ error: "Chave PIX já registrada" });
    }

    user.pixKey = pixKey;
    await user.save();

    const transaction = new Transaction({
      type: "pix/register",
      amount: 0,
      fromAccount: user.accountNumber,
      targetAccount: null,
      description: `Registro PIX: ${pixKey}`,
      userId,
    });
    await transaction.save();

    res.json({ message: "Chave PIX registrada", pixKey });
  } catch (error) {
    console.error("Erro no PIX registro:", error);
    res.status(500).json({ error: "Erro ao registrar chave PIX" });
  }
}

// Pagar Boleto
async function payBill(req, res) {
  const { billCode, amount } = req.body;
  const userId = req.user?.id;

  console.log(
    "Pagar Boleto - userId:",
    userId,
    "billCode:",
    billCode,
    "amount:",
    amount
  );

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuário não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    if (user.balance < amount) {
      console.log("Saldo insuficiente - user.balance:", user.balance);
      return res.status(400).json({ error: "Saldo insuficiente" });
    }
    if (amount <= 0) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor deve ser maior que zero" });
    }

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      type: "bill/pay",
      amount,
      fromAccount: user.accountNumber,
      targetAccount: billCode,
      description: "Pagamento de boleto",
      userId,
    });
    await transaction.save();

    res.json({ message: "Boleto pago", balance: user.balance });
  } catch (error) {
    console.error("Erro no pagamento de boleto:", error);
    res.status(500).json({ error: "Erro ao pagar boleto" });
  }
}

// Pegar Empréstimo
async function getLoan(req, res) {
  const { amount } = req.body;
  const userId = req.user?.id;

  console.log("Pegar Empréstimo - userId:", userId, "amount:", amount);

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuário não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    if (amount <= 0) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor deve ser maior que zero" });
    }

    user.balance += amount;
    await user.save();

    const transaction = new Transaction({
      type: "loan",
      amount,
      fromAccount: "VascoBank",
      targetAccount: user.accountNumber,
      description: `Empréstimo de R$ ${amount}`,
      userId,
    });
    await transaction.save();

    res.json({ message: "Empréstimo realizado", balance: user.balance });
  } catch (error) {
    console.error("Erro no empréstimo:", error);
    res.status(500).json({ error: "Erro ao processar empréstimo" });
  }
}

// Investir
async function invest(req, res) {
  const { amount, investmentType } = req.body;
  const userId = req.user?.id;

  console.log(
    "Investir - userId:",
    userId,
    "amount:",
    amount,
    "investmentType:",
    investmentType
  );

  try {
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    const user = await User.findById(userId);
    if (!user) {
      console.error("Usuário não encontrado para userId:", userId);
      return res.status(404).json({ error: "Conta não encontrada" });
    }

    if (user.balance < amount) {
      console.log("Saldo insuficiente - user.balance:", user.balance);
      return res.status(400).json({ error: "Saldo insuficiente" });
    }
    if (amount <= 0) {
      console.log("Valor inválido - amount:", amount);
      return res.status(400).json({ error: "Valor deve ser maior que zero" });
    }

    const validTypes = ["Tesouro Direto", "CDB", "Ações"];
    if (!validTypes.includes(investmentType)) {
      console.log(
        "Tipo de investimento inválido - investmentType:",
        investmentType
      );
      return res.status(400).json({ error: "Tipo de investimento inválido" });
    }

    user.balance -= amount;
    await user.save();

    let simulatedReturn = amount;
    if (investmentType === "Tesouro Direto") simulatedReturn *= 1.005;
    else if (investmentType === "CDB") simulatedReturn *= 1.07;
    else if (investmentType === "Ações")
      simulatedReturn *= 1 + Math.random() * 0.2 - 0.1;

    const transaction = new Transaction({
      type: "invest",
      amount,
      fromAccount: user.accountNumber,
      targetAccount: investmentType,
      description: `Investimento em ${investmentType}`,
      userId,
    });
    await transaction.save();

    res.json({
      message: "Investimento realizado",
      balance: user.balance,
      simulatedReturn: simulatedReturn.toFixed(2),
    });
  } catch (error) {
    console.error("Erro no investimento:", error);
    res.status(500).json({ error: "Erro ao processar investimento" });
  }
}

module.exports = {
  transfer,
  deposit,
  withdrawal,
  getHistory,
  pixTransfer,
  pixPayment,
  pixReceive,
  recharge,
  pixRegister,
  payBill,
  getLoan,
  invest,
};
