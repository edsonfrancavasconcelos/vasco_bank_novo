const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
  registerUser,
  loginUser,
  getUserInfo,
  getUserByAccountNumber,
  checkAuth,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

console.log('Inicializando userRoutes');

// Registrar usuário
router.post('/', (req, res, next) => {
  console.log('Recebido POST /api/users:', {
    body: { ...req.body, password: '[HIDDEN]' },
  });
  registerUser(req, res, next);
});

// Registrar usuário (mantido para compatibilidade)
router.post('/register', (req, res, next) => {
  console.log('Recebido POST /api/users/register:', {
    body: { ...req.body, password: '[HIDDEN]' },
  });
  registerUser(req, res, next);
});

// Login
router.post('/login', loginUser);

// Obter informações do usuário
router.get('/info', authMiddleware, getUserInfo);

// Obter usuário por número da conta
router.get('/account/:accountNumber', authMiddleware, getUserByAccountNumber);

// Verificar autenticação
router.get('/check', authMiddleware, checkAuth);

// Buscar usuário por CPF ou número da conta
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { identifier } = req.query;
    if (!identifier) {
      return res.status(400).json({ error: 'CPF ou número da conta é obrigatório' });
    }
    const user = await User.findOne({
      $or: [{ cpf: identifier }, { accountNumber: identifier }],
    });
    if (!user) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    console.log('Usuário encontrado por busca:', { fullName: user.fullName, accountNumber: user.accountNumber });
    res.status(200).json({
      fullName: user.fullName,
      cpf: user.cpf,
      accountNumber: user.accountNumber,
    });
  } catch (error) {
    console.error('Erro ao buscar conta:', error.message);
    res.status(500).json({ error: 'Erro ao buscar conta' });
  }
});

// Obter dados do usuário autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('Acessando rota /api/users/me, userId:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      console.log('Usuário não encontrado:', req.user.id);
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    console.log('Dados do usuário enviados:', {
      fullName: user.fullName,
      accountNumber: user.accountNumber,
      balance: user.balance,
    });
    res.json({
      fullName: user.fullName,
      accountNumber: user.accountNumber,
      balance: user.balance,
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;