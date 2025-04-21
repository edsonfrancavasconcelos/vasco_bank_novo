// backend/controllers/quoteController.js
// Data: 18/04/2025
const getQuotes = async (req, res) => {
  try {
    // Dados mockados de cotações no formato esperado pelo frontend
    const quotes = {
      'USD/BRL': { rate: 5.65, updated: new Date().toISOString() },
      'EUR/BRL': { rate: 6.72, updated: new Date().toISOString() },
      'BTC/BRL': { rate: 350000, updated: new Date().toISOString() }
    };
    console.log('Cotações enviadas:', quotes);
    res.status(200).json({ quotes });
  } catch (error) {
    console.error('Erro em /api/quotes:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao carregar cotações' });
  }
};

module.exports = { getQuotes };