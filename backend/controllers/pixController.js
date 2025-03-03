const Pix = require("../models/Pix"); // Modelo para armazenar transações de Pix
const Account = require("../models/Account"); // Modelo para contas

// Função para realizar Pix
exports.makePix = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount } = req.body;

    // Validação dos dados recebidos
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({
        error:
          "Dados incompletos. Verifique fromAccountId, toAccountId e amount.",
      });
    }

    // Verifica se as contas existem
    const fromAccount = await Account.findById(fromAccountId);
    const toAccount = await Account.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      return res
        .status(404)
        .json({ error: "Uma ou ambas as contas não foram encontradas." });
    }

    // Verifica se há saldo suficiente
    if (fromAccount.balance < amount) {
      return res
        .status(400)
        .json({ error: "Saldo insuficiente para realizar o Pix." });
    }

    // Deduzir o valor da conta de origem e adicionar à conta de destino
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    // Salvar as alterações nas contas
    await fromAccount.save();
    await toAccount.save();

    // Criar um registro de Pix
    const newPix = new Pix({
      fromAccountId,
      toAccountId,
      amount,
      timestamp: new Date(),
    });
    await newPix.save();

    res.status(200).json({ message: "Pix realizado com sucesso", pix: newPix });
  } catch (error) {
    console.error("Erro ao realizar Pix:", error);
    res.status(500).json({ error: "Erro ao realizar Pix" });
  }
};
