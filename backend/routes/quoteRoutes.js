// backend/routes/quote.js
// Data: 18/04/2025
const router = require('express').Router();
const { getQuotes } = require('../controllers/quoteController');
const authMiddleware = require('../middleware/authMiddleware');
router.get('/', authMiddleware, getQuotes);
const fetch = require('node-fetch');

// Middleware para autenticação (baseado no seu token JWT)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // Verificar token (exemplo simplificado, ajuste conforme sua lógica)
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, 'sua-chave-secreta'); // Substitua 'sua-chave-secreta' pela sua chave
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Endpoint /api/quotes
router.get('/quotes', authenticateToken, async (req, res) => {
  try {
    // Chave da ExchangeRate-API (substitua pela sua chave)
    const exchangeRateApiKey = 'SUA_CHAVE_EXCHANGERATE_API'; // Ex.: 'abc123def456'

    // Requisições paralelas para ExchangeRate-API (moedas) e CoinGecko (BTC/BRL)
    const [fiatResponse, cryptoResponse] = await Promise.all([
      fetch(`https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/latest/USD`),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl')
    ]);

    // Verificar respostas
    if (!fiatResponse.ok) {
      throw new Error(`Erro na ExchangeRate-API: ${fiatResponse.status}`);
    }
    if (!cryptoResponse.ok) {
      throw new Error(`Erro na CoinGecko: ${cryptoResponse.status}`);
    }

    const fiatData = await fiatResponse.json();
    const cryptoData = await cryptoResponse.json();

    // Verificar se os dados estão no formato esperado
    if (!fiatData.rates || !cryptoData.bitcoin) {
      throw new Error('Formato de dados inválido');
    }

    // Mock para índices/acões (substituir por API real no futuro)
    const mockStockQuotes = {
      'IBOVESPA': { rate: '125000', updated: new Date().toISOString() },
      'SP500': { rate: '5000', updated: new Date().toISOString() },
      'NASDAQ': { rate: '16000', updated: new Date().toISOString() },
      'PETR4': { rate: '40.50', updated: new Date().toISOString() },
      'AAPL': { rate: '190.00', updated: new Date().toISOString() }
    };

    // Construir resposta no formato esperado pelo frontend
    const quotes = {
      quotes: {
        'USD': { rate: fiatData.rates.BRL.toFixed(2), updated: new Date().toISOString() },
        'EUR': { rate: (fiatData.rates.BRL / fiatData.rates.EUR).toFixed(2), updated: new Date().toISOString() },
        'GBP': { rate: (fiatData.rates.BRL / fiatData.rates.GBP).toFixed(2), updated: new Date().toISOString() },
        'JPY': { rate: (fiatData.rates.BRL / fiatData.rates.JPY).toFixed(3), updated: new Date().toISOString() },
        'CHF': { rate: (fiatData.rates.BRL / fiatData.rates.CHF).toFixed(2), updated: new Date().toISOString() },
        'BTC/BRL': { rate: cryptoData.bitcoin.brl.toFixed(0), updated: new Date().toISOString() },
        ...mockStockQuotes
      }
    };

    res.json(quotes);
  } catch (error) {
    console.error('Erro ao buscar cotações:', error.message);
    res.status(500).json({ error: `Erro ao buscar cotações: ${error.message}` });
  }
});

module.exports = router;

