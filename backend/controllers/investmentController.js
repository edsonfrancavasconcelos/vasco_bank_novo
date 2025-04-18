const User = require('../models/User');
const Transaction = require('../models/Transaction');

const invest = async (req, res) => {
  try {
    const { type, amount } = req.body;
    if (!type || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Tipo e valor são obrigatórios' });
    }

    const validTypes = ['cdb', 'tesouro', 'stocks'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Tipo de investimento inválido' });
    }

    const user = await User.findById(req.user.id);
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    user.balance -= amount;

    const transaction = new Transaction({
      userId: req.user.id,
      type: 'investment',
      amount,
      details: { investmentType: type }
    });

    await Promise.all([user.save(), transaction.save()]);
    res.json({ message: 'Investimento realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao investir:', error.stack);
    res.status(500).json({ error: 'Erro ao realizar investimento' });
  }
};

module.exports = { invest };