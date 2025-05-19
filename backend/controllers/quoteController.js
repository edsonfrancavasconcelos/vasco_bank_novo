const axios = require('axios');

const getQuotes = async (req, res) => {
  try {
    // Simulação: substituir por chamada real à API (ex.: Alpha Vantage)
    const quotes = {
      'USD/BRL': { rate: 5.65, updated: new Date().toISOString() },
      'EUR/BRL': { rate: 6.72, updated: new Date().toISOString() },
      'BTC/BRL': { rate: 350000, updated: new Date().toISOString() },
    };
    res.status(200).json({ quotes });
  } catch (error) {
    console.error('Erro ao carregar cotações:', error.stack);
    res.status(500).json({ error: `Erro ao carregar cotações: ${error.message}` });
  }
};

module.exports = { getQuotes };