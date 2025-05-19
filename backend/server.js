const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Carregar modelos com verificação
const models = [
  './models/User',
  './models/Transaction',
  './models/Card',
  './models/PixKey',
  './models/Loan',
  './models/Investment',
  './models/VirtualCard',
];

models.forEach(modelPath => {
  try {
    if (fs.existsSync(path.join(__dirname, `${modelPath}.js`))) {
      require(modelPath);
      console.log(`Modelo ${modelPath} carregado com sucesso`);
    } else {
      console.warn(`Modelo ${modelPath} não encontrado, pulando...`);
    }
  } catch (error) {
    console.error(`Erro ao carregar modelo ${modelPath}:`, error.message);
  }
});

// Rotas
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const loginRoutes = require('./routes/loginRoutes');
const cardRoutes = require('./routes/cardRoutes');
const pixRoutes = require('./routes/pixRoutes');
const loanRoutes = require('./routes/loanRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const virtualCardRoutes = require('./routes/virtualCardRoutes');
const financialRoutes = require('./routes/financialRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const { getTransactionHistory } = require('./controllers/transactionController');

console.log('Rotas carregadas:', {
  userRoutes: !!userRoutes,
  transactionRoutes: !!transactionRoutes,
  loginRoutes: !!loginRoutes,
  cardRoutes: !!cardRoutes,
  pixRoutes: !!pixRoutes,
  loanRoutes: !!loanRoutes,
  investmentRoutes: !!investmentRoutes,
  virtualCardRoutes: !!virtualCardRoutes,
  financialRoutes: !!financialRoutes,
});

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.static(path.join(__dirname, '../frontend/pages')));

// Log de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/vasco_bank';
console.log('Mongo URI:', mongoURI.replace(/:([^:@]+)@/, ':****@'));
mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    retryWrites: true,
  })
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso!'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB Atlas:', err);
    process.exit(1);
  });

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB desconectado, tentando reconectar...');
});
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconectado com sucesso!');
});

// Cache para cotações
let quotesCache = null;
let lastUpdate = null;
const CACHE_DURATION = 60 * 1000; // 1 minuto

// Rotas API
console.log('Registrando rotas API');
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/cards', authMiddleware, cardRoutes);
app.use('/api/pix', authMiddleware, pixRoutes);
app.use('/api/loans', authMiddleware, loanRoutes);
app.use('/api/investments', authMiddleware, investmentRoutes);
console.log('Registrando virtualCardRoutes:', virtualCardRoutes);
app.use('/api/virtualCards', virtualCardRoutes);
app.use('/api/financial', authMiddleware, financialRoutes);

// Rota para histórico de transações
app.get('/api/transactions/history', authMiddleware, getTransactionHistory);

// Rota para cotações
app.get('/api/quotes', authMiddleware, async (req, res) => {
  console.log('GET /api/quotes - userId:', req.user.id);
  try {
    const now = Date.now();
    if (quotesCache && lastUpdate && now - lastUpdate < CACHE_DURATION) {
      console.log('Retornando cotações do cache');
      return res.json(quotesCache);
    }

    const apiKey = process.env.EXCHANGERATE_API_KEY;
    if (!apiKey) {
      console.error('Chave da ExchangeRatesAPI não configurada');
      quotesCache = [
        { symbol: 'USD/BRL', price: '5.60' },
        { symbol: 'EUR/BRL', price: '6.20' },
        { symbol: 'USD/EUR', price: '0.90' }
      ];
      lastUpdate = now;
      return res.json(quotesCache);
    }

    const base = req.query.base ? req.query.base.toUpperCase() : 'USD';
    const symbols = req.query.symbols ? req.query.symbols.toUpperCase() : 'BRL,EUR,JPY';
    const url = `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&base=${base}&symbols=${symbols}`;
    console.log('Buscando cotações:', url.replace(apiKey, '****'));

    let response;
    try {
      response = await axios.get(url);
    } catch (apiError) {
      console.error('Erro na ExchangeRatesAPI:', apiError.message);
      if (quotesCache) {
        console.log('Retornando cache devido a erro');
        return res.json(quotesCache);
      }
      quotesCache = [
        { symbol: 'USD/BRL', price: '5.60' },
        { symbol: 'EUR/BRL', price: '6.20' },
        { symbol: 'USD/EUR', price: '0.90' }
      ];
      lastUpdate = now;
      return res.json(quotesCache);
    }

    const data = response.data;
    if (!data.success) {
      console.error('Erro na resposta da ExchangeRatesAPI:', data);
      if (quotesCache) {
        console.log('Retornando cache devido a erro');
        return res.json(quotesCache);
      }
      quotesCache = [
        { symbol: 'USD/BRL', price: '5.60' },
        { symbol: 'EUR/BRL', price: '6.20' },
        { symbol: 'USD/EUR', price: '0.90' }
      ];
      lastUpdate = now;
      return res.json(quotesCache);
    }

    const rates = data.rates;
    const formattedQuotes = [
      { symbol: 'USD/BRL', price: (rates.BRL / rates.USD || 5.60).toFixed(2) },
      { symbol: 'EUR/BRL', price: (rates.BRL / rates.EUR || 6.20).toFixed(2) },
      { symbol: 'USD/EUR', price: (rates.EUR / rates.USD || 0.90).toFixed(2) },
      { symbol: 'JPY/BRL', price: (rates.BRL / rates.JPY || 0.04).toFixed(2) }
    ];

    quotesCache = formattedQuotes;
    lastUpdate = now;
    console.log('Cotações atualizadas:', formattedQuotes);
    res.json(formattedQuotes);
  } catch (error) {
    console.error('Erro no endpoint /api/quotes:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Fallback para frontend (depois das rotas API)
app.get('*', (req, res) => {
  console.log('Fallback para index.html:', req.url);
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// Middleware para erros 404 (APIs)
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    console.log('Rota API não encontrada:', req.method, req.url);
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  next();
});

// Middleware para erros gerais
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err.message, err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Vasconcelos rodando na porta ${PORT}`));