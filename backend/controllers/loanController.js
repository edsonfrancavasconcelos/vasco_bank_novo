const User = require('../models/User');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');

const requestLoan = async (req, res) => {
  try {
    const { amount, installments } = req.body;
    if (!amount || !installments || amount <= 0 || installments <= 0) {
      return res.status(400).json({ error: 'Valor e número de parcelas são obrigatórios' });
    }

    const loan = new Loan({
      userId: req.user.id,
      amount,
      installments
    });

    const user = await User.findById(req.user.id);
    user.balance += amount;

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'loan',
      amount,
      details: { installments }
    });

    await Promise.all([loan.save(), user.save(), transaction.save()]);
    res.json({ message: 'Empréstimo solicitado com sucesso' });
  } catch (error) {
    console.error('Erro ao solicitar empréstimo:', error.stack);
    res.status(500).json({ error: 'Erro ao solicitar empréstimo' });
  }
};

module.exports = { requestLoan };