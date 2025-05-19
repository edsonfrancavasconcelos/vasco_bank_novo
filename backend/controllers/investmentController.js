const Investment = require('../models/Investment');

// Obter todos os investimentos do usuário autenticado
exports.getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user.id });
    res.json(investments);
  } catch (error) {
    console.error('Erro ao buscar investimentos:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
};

// Criar um novo investimento
exports.createInvestment = async (req, res) => {
  const { type, amount, returnRate } = req.body;
  try {
    if (!type || !amount || !returnRate) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    const investment = new Investment({
      userId: req.user.id,
      type,
      amount,
      returnRate,
    });
    await investment.save();
    res.status(201).json(investment);
  } catch (error) {
    console.error('Erro ao criar investimento:', error);
    res.status(400).json({ error: 'Dados de investimento inválidos' });
  }
};