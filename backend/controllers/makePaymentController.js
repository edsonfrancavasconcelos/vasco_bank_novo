const Payment = require("../models/Payment"); // Certifique-se de que o caminho do modelo está correto

exports.makePayment = async (req, res) => {
  try {
    const { accountId, amount, method } = req.body;

    // Validação básica dos dados recebidos
    if (!accountId || !amount || !method) {
      return res
        .status(400)
        .json({
          message: "Dados incompletos. Verifique accountId, amount e method.",
        });
    }

    // Cria um novo pagamento
    const payment = new Payment({
      accountId,
      amount,
      method,
      createdAt: new Date(), // Você pode adicionar outros campos se necessário
    });

    // Salva o pagamento no banco de dados
    await payment.save();

    // Responde com sucesso
    res
      .status(201)
      .json({ message: "Pagamento realizado com sucesso", payment });
  } catch (error) {
    console.error("Erro ao realizar pagamento:", error);
    res
      .status(500)
      .json({ message: "Erro ao realizar pagamento", error: error.message });
  }
};
