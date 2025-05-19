const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sanitizeHtml = require('sanitize-html');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const registerUser = async (req, res) => {
  try {
    const { fullName, email, cpf, rg, address, password, phone, initialBalance } = req.body;
    console.log('Tentativa de cadastro - Dados recebidos:', { fullName, email, cpf, rg, address, password: '[HIDDEN]', phone, initialBalance });

    // Validações
    if (!fullName || !email || !cpf || !password || !phone) {
      console.log('Validação falhou: campos obrigatórios ausentes', { fullName, email, cpf, password: '[HIDDEN]', phone });
      return res.status(400).json({ error: 'Nome, e-mail, CPF, senha e telefone são obrigatórios' });
    }
    if (!/^\d{11}$/.test(cpf)) {
      console.log('Validação falhou: CPF inválido', { cpf });
      return res.status(400).json({ error: 'CPF inválido' });
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      console.log('Validação falhou: email inválido', { email });
      return res.status(400).json({ error: 'E-mail inválido' });
    }
    if (!/^\d{11}$/.test(phone)) {
      console.log('Validação falhou: telefone inválido', { phone });
      return res.status(400).json({ error: 'Telefone inválido' });
    }

    // Verifica duplicatas
    const userExists = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
        { cpf },
        { phone },
      ],
    });
    console.log('Verificação de duplicatas:', userExists ? { email: userExists.email, cpf: userExists.cpf, phone: userExists.phone } : 'Nenhuma duplicata encontrada');
    if (userExists) {
      return res.status(400).json({ error: 'E-mail, CPF ou telefone já registrado' });
    }

    // Sanitiza entradas
    const sanitizedFullName = sanitizeHtml(fullName);
    const sanitizedAddress = address ? sanitizeHtml(address) : undefined;

    // Senha será hasheada pelo User.js
    console.log('Enviando senha para User.js:', { email, passwordLength: password.length });
    const hashedPassword = password; // O User.js cuida do hash

    const user = new User({
      fullName: sanitizedFullName,
      email: email.toLowerCase(),
      cpf,
      rg,
      address: sanitizedAddress,
      password: hashedPassword,
      phone,
      accountNumber: `ACC${Math.floor(100000 + Math.random() * 900000)}`,
      balance: initialBalance || 0,
    });

    await user.save();
    console.log('Usuário salvo no banco:', { email: user.email, accountNumber: user.accountNumber });

    const token = jwt.sign(
      { id: user._id, accountNumber: user.accountNumber, email: user.email },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '1h' }
    );

    console.log('Usuário registrado com sucesso:', { fullName: user.fullName, email: user.email, accountNumber: user.accountNumber });

    res.status(201).json({
      message: 'Conta criada com sucesso',
      token,
      user: { fullName: user.fullName, email: user.email, accountNumber: user.accountNumber },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error.stack);
    if (error.code === 11000) {
      console.log('Erro de duplicata:', error.keyValue);
      return res.status(400).json({ error: 'E-mail, CPF ou telefone já cadastrado' });
    }
    res.status(500).json({ error: `Erro ao registrar usuário: ${error.message}` });
  }
};

// Funções existentes (loginUser, getUserInfo, etc.) permanecem inalteradas
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentativa de login - Dados recebidos:', { email, password: '[HIDDEN]' });

    if (!email || !password) {
      console.log('Validação falhou: email ou senha ausentes');
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      console.log('Validação falhou: email inválido:', email);
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } });
    console.log('Resultado da busca:', user ? { id: user._id, email: user.email, passwordHash: '[HIDDEN]' } : 'Usuário não encontrado');

    if (!user) {
      console.log('Erro: usuário não encontrado para email:', normalizedEmail);
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Verificação de senha:', { isMatch, email: normalizedEmail });

    if (!isMatch) {
      console.log('Erro: senha incorreta para email:', normalizedEmail);
      return res.status(401).json({ error: 'Usuário ou senha incorretos' });
    }

    const token = jwt.sign(
      { id: user._id, accountNumber: user.accountNumber, email: user.email },
      process.env.JWT_SECRET || 'sua_chave_secreta',
      { expiresIn: '1h' }
    );
    console.log('Token gerado para usuário:', { email: normalizedEmail });

    console.log('Login bem-sucedido:', { fullName: user.fullName, email: user.email });

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: { fullName: user.fullName, email: user.email, accountNumber: user.accountNumber, balance: user.balance },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error.stack);
    res.status(500).json({ error: `Erro ao fazer login: ${error.message}` });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    console.log('Informações do usuário enviadas:', { fullName: user.fullName, accountNumber: user.accountNumber });
    res.status(200).json({
      fullName: user.fullName,
      email: user.email,
      accountNumber: user.accountNumber,
      balance: user.balance,
    });
  } catch (error) {
    console.error('Erro ao buscar info do usuário:', error.stack);
    res.status(500).json({ error: `Erro ao buscar informações: ${error.message}` });
  }
};

const getUserByAccountNumber = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    if (!/^ACC\d{6}$/.test(accountNumber)) {
      return res.status(400).json({ error: 'Número da conta inválido' });
    }
    const user = await User.findOne({ accountNumber }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    console.log('Usuário encontrado por conta:', { fullName: user.fullName, accountNumber: user.accountNumber });
    res.status(200).json({ fullName: user.fullName, accountNumber: user.accountNumber });
  } catch (error) {
    console.error('Erro ao buscar usuário por conta:', error.stack);
    res.status(500).json({ error: `Erro ao buscar usuário: ${error.message}` });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    console.log('Histórico de transações enviado:', { userId: req.user.id, count: transactions.length });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error.stack);
    res.status(500).json({ error: `Erro ao carregar histórico: ${error.message}` });
  }
};

const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    console.log('Autenticação verificada:', { fullName: user.fullName, email: user.email });
    res.status(200).json({
      message: 'Autenticação válida',
      user: { fullName: user.fullName, email: user.email, accountNumber: user.accountNumber },
    });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error.stack);
    res.status(500).json({ error: `Erro ao verificar autenticação: ${error.message}` });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserInfo,
  getUserByAccountNumber,
  getTransactionHistory,
  checkAuth,
};