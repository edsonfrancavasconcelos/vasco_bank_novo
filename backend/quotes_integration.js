/**
 * Integração da API de Cotação com o servidor Vasconcelos Bank
 *
 * Este arquivo demonstra como integrar o cliente da API de cotação
 * com a rota /api/quotes existente no servidor.
 */

// Importar o cliente da API de cotação
const stockApiClient = require("./stock_api_client");
const fetch = require("node-fetch");

/**
 * Função para substituir a implementação atual da rota /api/quotes
 * Esta função mantém a mesma estrutura de resposta e adiciona dados de ações reais
 */
async function getQuotes(req, res) {
  try {
    // Obter chave da API de câmbio do ambiente
    const exchangeRateApiKey = process.env.EXCHANGERATE_API_KEY;
    if (!exchangeRateApiKey) {
      console.warn("EXCHANGERATE_API_KEY não configurada no .env");
      throw new Error("Chave da ExchangeRate-API não configurada");
    }

    // Fazer requisições em paralelo para moedas, criptomoedas e ações
    const [fiatResponse, cryptoResponse, stockQuotesResult] = await Promise.all(
      [
        // Manter a implementação original para moedas
        fetch(
          `https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/latest/USD`,
          { timeout: 5000 }
        ),
        // Manter a implementação original para criptomoedas
        fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_last_updated_at=true",
          { timeout: 5000 }
        ),
        // Nova implementação para ações usando nossa API
        stockApiClient.getAllQuotes().catch((error) => {
          console.error("Erro ao obter cotações de ações:", error.message);
          return { quotes: {} }; // Retornar objeto vazio em caso de erro
        }),
      ]
    );

    // Verificar respostas das APIs de moedas e criptomoedas
    if (!fiatResponse.ok) {
      throw new Error(`Erro na ExchangeRate-API: ${fiatResponse.status}`);
    }
    if (!cryptoResponse.ok) {
      throw new Error(`Erro na CoinGecko: ${cryptoResponse.status}`);
    }

    // Processar dados de moedas e criptomoedas
    const fiatData = await fiatResponse.json();
    const cryptoData = await cryptoResponse.json();

    if (!fiatData.rates || !cryptoData.bitcoin) {
      throw new Error("Formato de dados inválido das APIs");
    }

    // Combinar todas as cotações no formato esperado pelo frontend
    const quotes = {
      quotes: {
        // Cotações de moedas (implementação original)
        USD: {
          rate: fiatData.rates.BRL.toFixed(2),
          updated: new Date().toISOString(),
        },
        EUR: {
          rate: (fiatData.rates.BRL / fiatData.rates.EUR).toFixed(2),
          updated: new Date().toISOString(),
        },
        GBP: {
          rate: (fiatData.rates.BRL / fiatData.rates.GBP).toFixed(2),
          updated: new Date().toISOString(),
        },
        JPY: {
          rate: (fiatData.rates.BRL / fiatData.rates.JPY).toFixed(3),
          updated: new Date().toISOString(),
        },
        CHF: {
          rate: (fiatData.rates.BRL / fiatData.rates.CHF).toFixed(2),
          updated: new Date().toISOString(),
        },

        // Cotação de Bitcoin (implementação original)
        "BTC/BRL": {
          rate: cryptoData.bitcoin.brl.toFixed(0),
          updated: new Date(
            cryptoData.bitcoin.last_updated_at * 1000
          ).toISOString(),
        },

        // Cotações de ações (nova implementação usando nossa API)
        ...stockQuotesResult.quotes,
      },
    };

    console.log("Cotações enviadas (com dados reais de ações):", quotes);
    res.status(200).json(quotes);
  } catch (error) {
    console.error("Erro na rota /api/quotes:", error.message, error.stack);

    // Usar dados de fallback em caso de erro (mantendo a implementação original)
    const fallbackQuotes = {
      USD: { rate: "5.65", updated: new Date().toISOString() },
      EUR: { rate: "6.72", updated: new Date().toISOString() },
      GBP: { rate: "7.10", updated: new Date().toISOString() },
      JPY: { rate: "0.035", updated: new Date().toISOString() },
      CHF: { rate: "6.00", updated: new Date().toISOString() },
      "BTC/BRL": { rate: "350000", updated: new Date().toISOString() },
      IBOVESPA: { rate: "125000", updated: new Date().toISOString() },
      SP500: { rate: "5000", updated: new Date().toISOString() },
      NASDAQ: { rate: "16000", updated: new Date().toISOString() },
      PETR4: { rate: "40.50", updated: new Date().toISOString() },
      AAPL: { rate: "190.00", updated: new Date().toISOString() },
    };

    console.log("Usando cotações mockadas como fallback:", fallbackQuotes);
    res.status(200).json({ quotes: fallbackQuotes });
  }
}

module.exports = {
  getQuotes,
};
