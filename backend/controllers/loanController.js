// backend/controllers/loanController.js
// Data: 18/04/2025
const mongoose = require('mongoose');
const User = mongoose.model('User'); // Modelo do usuário
const Loan = mongoose.model('Loan'); // Modelo do empréstimo
const Transaction = mongoose.model('Transaction'); // Modelo da transação

exports.requestLoan = async (req, res) => {
  try {
    const { amount, installments, fromAccount } = req.body;
    console.log('Recebido em /api/loans/request:', { amount, installments, fromAccount });
    console.log('Usuário do authMiddleware:', req.user ? { userId: req.user._id, accountNumber: req.user.accountNumber } : 'Nenhum usuário encontrado');

    // Validações
    if (!amount || !installments || !fromAccount) {
      console.log('Validação falhou: campos obrigatórios faltando');
      return res.status(400).json({ error: 'Amount, installments e fromAccount são obrigatórios' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      console.log('Validação falhou: amount inválido', { amount });
      return res.status(400).json({ error: 'Valor do empréstimo deve ser um número positivo' });
    }
    if (typeof installments !== 'number' || ![6, 12, 24].includes(installments)) {
      console.log('Validação falhou: installments inválido', { installments });
      return res.status(400).json({ error: 'Parcelas devem ser 6, 12 ou 24' });
    }

    // Verifica o usuário do authMiddleware
    if (!req.user) {
      console.log('Nenhum usuário autenticado encontrado');
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Valida se fromAccount corresponde ao usuário logado
    if (req.user.accountNumber !== fromAccount) {
      console.log('fromAccount não corresponde ao usuário logado:', { fromAccount, userAccountNumber: req.user.accountNumber });
      return res.status(400).json({ error: 'Número da conta inválido para o usuário logado' });
    }

    // Busca o usuário no banco pra garantir
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('Usuário não encontrado no banco:', req.user._id);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    console.log('Usuário encontrado:', { userId: user._id, accountNumber: user.accountNumber });

    // Cria o empréstimo
    const loan = new Loan({
      userId: user._id,
      amount,
      installments,
      status: 'pending'
    });
    await loan.save();
    console.log('Empréstimo criado:', loan);

    // Cria a transação
    const transaction = new Transaction({
      type: 'loan',
      amount,
      fromAccount,
      installments,
      userId: user._id,
      description: `Empréstimo de R$${amount} em ${installments} parcelas`,
      status: 'pending'
    });
    await transaction.save();
    console.log('Transação criada:', transaction);

    // Atualiza o saldo do usuário (exemplo, ajuste conforme sua lógica)
    user.balance += amount;
    await user.save();
    console.log('Saldo do usuário atualizado:', { userId: user._id, newBalance: user.balance });

    res.status(200).json({ message: 'Empréstimo solicitado com sucesso', loan, transaction });
  } catch (error) {
    console.error('Erro em /api/loans/request:', error.message, error.stack);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: `Erro de validação: ${error.message}` });
    }
    res.status(500).json({ error: 'Erro interno no servidor ao processar o empréstimo' });
  }
};