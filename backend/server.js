const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
require("dotenv").config();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const loginRoutes = require("./routes/loginRoutes");
const cardRoutes = require("./routes/cardRoutes");
const pixRoutes = require("./routes/pixRoutes");
const loanRoutes = require("./routes/loanRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const { getTransactionHistory } = require("./controllers/transactionController");

const app = express();

// Logs pra debug dos routers
console.log("userRoutes:", userRoutes);
console.log("transactionRoutes:", transactionRoutes);
console.log("loginRoutes:", loginRoutes);
console.log("cardRoutes:", cardRoutes);
console.log("pixRoutes:", pixRoutes);
console.log("loanRoutes:", loanRoutes);
console.log("investmentRoutes:", investmentRoutes);
console.log("authMiddleware:", authMiddleware);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:8080", credentials: true }));
app.use(express.static(path.join(__dirname, "../frontend/pages")));

// MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/vasco_bank";
mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    retryWrites: true,
  })
  .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB Atlas:", err);
    process.exit(1);
  });

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB desconectado, tentando reconectar...");
});
mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconectado com sucesso!");
});

// Função para gerar número de cartão simulado
const generateCardNumber = () => {
  const firstSix = '411111'; // Simulando Visa
  const lastFour = Math.floor(1000 + Math.random() * 9000).toString();
  const middle = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${firstSix}${middle}${lastFour}`;
};

// Rotas
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/cards", authMiddleware, cardRoutes);
app.use("/api/pix", authMiddleware, pixRoutes);
app.use("/api/loans", authMiddleware, loanRoutes);
app.use("/api/investments", authMiddleware, investmentRoutes);

// Rota para histórico de transações
app.get("/api/transactions/history", authMiddleware, getTransactionHistory);

// Rota para dados financeiros
app.get("/api/financial", authMiddleware, async (req, res) => {
  try {
    const Card = require("./models/Card");
    const Loan = require("./models/Loan");
    const card = await Card.findOne({ userId: req.user.id }) || { invoice: 0 };
    const loans = await Loan.find({ userId: req.user.id });
    res.json({
      card: { invoice: card.invoice || 0 },
      loans: loans.map(l => ({ amount: l.amount, installments: l.installments })),
      consigned: []
    });
  } catch (error) {
    console.error("Erro na rota /api/financial:", error.stack);
    res.status(500).json({ error: "Erro interno ao buscar dados financeiros" });
  }
});

// Rota para cotações em tempo real
app.get("/api/quotes", authMiddleware, async (req, res) => {
  try {
    const exchangeRateApiKey = process.env.EXCHANGERATE_API_KEY;
    if (!exchangeRateApiKey) {
      console.warn("EXCHANGERATE_API_KEY não configurada no .env");
      throw new Error("Chave da ExchangeRate-API não configurada");
    }

    const [fiatResponse, cryptoResponse] = await Promise.all([
      fetch(`https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/latest/USD`, { timeout: 5000 }),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_last_updated_at=true', { timeout: 5000 })
    ]);

    if (!fiatResponse.ok) {
      throw new Error(`Erro na ExchangeRate-API: ${fiatResponse.status}`);
    }
    if (!cryptoResponse.ok) {
      throw new Error(`Erro na CoinGecko: ${cryptoResponse.status}`);
    }

    const fiatData = await fiatResponse.json();
    const cryptoData = await cryptoResponse.json();

    if (!fiatData.rates || !cryptoData.bitcoin) {
      throw new Error("Formato de dados inválido das APIs");
    }

    const mockStockQuotes = {
      'IBOVESPA': { rate: '125000', updated: new Date().toISOString() },
      'SP500': { rate: '5000', updated: new Date().toISOString() },
      'NASDAQ': { rate: '16000', updated: new Date().toISOString() },
      'PETR4': { rate: '40.50', updated: new Date().toISOString() },
      'AAPL': { rate: '190.00', updated: new Date().toISOString() }
    };

    const quotes = {
      quotes: {
        'USD': { rate: fiatData.rates.BRL.toFixed(2), updated: new Date().toISOString() },
        'EUR': { rate: (fiatData.rates.BRL / fiatData.rates.EUR).toFixed(2), updated: new Date().toISOString() },
        'GBP': { rate: (fiatData.rates.BRL / fiatData.rates.GBP).toFixed(2), updated: new Date().toISOString() },
        'JPY': { rate: (fiatData.rates.BRL / fiatData.rates.JPY).toFixed(3), updated: new Date().toISOString() },
        'CHF': { rate: (fiatData.rates.BRL / fiatData.rates.CHF).toFixed(2), updated: new Date().toISOString() },
        'BTC/BRL': { rate: cryptoData.bitcoin.brl.toFixed(0), updated: new Date(cryptoData.bitcoin.last_updated_at * 1000).toISOString() },
        ...mockStockQuotes
      }
    };

    console.log('Cotações enviadas:', quotes);
    res.status(200).json(quotes);
  } catch (error) {
    console.error("Erro na rota /api/quotes:", error.message, error.stack);
    const fallbackQuotes = {
      'USD': { rate: '5.65', updated: new Date().toISOString() },
      'EUR': { rate: '6.72', updated: new Date().toISOString() },
      'GBP': { rate: '7.10', updated: new Date().toISOString() },
      'JPY': { rate: '0.035', updated: new Date().toISOString() },
      'CHF': { rate: '6.00', updated: new Date().toISOString() },
      'BTC/BRL': { rate: '350000', updated: new Date().toISOString() },
      'IBOVESPA': { rate: '125000', updated: new Date().toISOString() },
      'SP500': { rate: '5000', updated: new Date().toISOString() },
      'NASDAQ': { rate: '16000', updated: new Date().toISOString() },
      'PETR4': { rate: '40.50', updated: new Date().toISOString() },
      'AAPL': { rate: '190.00', updated: new Date().toISOString() }
    };
    console.log('Usando cotações mockadas como fallback:', fallbackQuotes);
    res.status(200).json({ quotes: fallbackQuotes });
  }
});

// Rota para criar cartão virtual
app.post("/api/virtual-cards", authMiddleware, async (req, res) => {
  try {
    const { limit, type } = req.body;
    if (!limit || limit <= 0 || !type || !['single-use', 'multi-use'].includes(type)) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const VirtualCard = require("./models/VirtualCard");
    const cardNumber = generateCardNumber();
    const card = new VirtualCard({
      userId: req.user.id,
      number: cardNumber,
      lastFour: cardNumber.slice(-4),
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      expiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }),
      limit: parseFloat(limit),
      type,
      status: 'active'
    });

    await card.save();
    res.status(201).json({ message: 'Cartão virtual criado com sucesso' });
  } catch (error) {
    console.error("Erro na rota /api/virtual-cards:", error.stack);
    res.status(500).json({ error: 'Erro ao criar cartão virtual' });
  }
});

// Rota para listar cartões virtuais do usuário
app.get("/api/virtual-cards", authMiddleware, async (req, res) => {
  try {
    const VirtualCard = require("./models/VirtualCard");
    const cards = await VirtualCard.find({ userId: req.user.id });
    res.json(cards);
  } catch (error) {
    console.error("Erro na rota /api/virtual-cards:", error.stack);
    res.status(500).json({ error: 'Erro ao listar cartões virtuais' });
  }
});

// Rota para solicitar cartão adicional
app.post("/api/card-requests", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Motivo não fornecido' });
    }

    const CardRequest = require("./models/CardRequest");
    const request = new CardRequest({
      userId: req.user.id,
      reason,
      status: 'pending'
    });

    await request.save();
    res.status(201).json({ message: 'Solicitação de cartão enviada com sucesso' });
  } catch (error) {
    console.error("Erro na rota /api/card-requests:", error.stack);
    res.status(500).json({ error: 'Erro ao solicitar cartão' });
  }
});

// Rota para admin listar solicitações de cartões
app.get("/api/card-requests", authMiddleware, async (req, res) => {
  try {
    const User = require("./models/User");
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const CardRequest = require("./models/CardRequest");
    const requests = await CardRequest.find().populate('userId', 'name email');
    res.json(requests);
  } catch (error) {
    console.error("Erro na rota /api/card-requests:", error.stack);
    res.status(500).json({ error: 'Erro ao listar solicitações' });
  }
});

// Rota para recuperação de acesso
app.post("/api/recover-access", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email é obrigatório" });
    }

    const User = require("./models/User");
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "sua_chave_secreta", { expiresIn: "1h" });
    console.log(`Token de recuperação para ${email}: ${resetToken}`);
    res.json({ message: "Link de recuperação enviado para o email" });
  } catch (error) {
    console.error("Erro na rota /api/recover-access:", error.stack);
    res.status(500).json({ error: "Erro ao processar recuperação de acesso" });
  }
});

// Rota para produtos
app.get("/api/products", authMiddleware, async (req, res) => {
  try {
    const products = [
      { id: 1, name: "Seguro de Vida", price: 50 },
      { id: 2, name: "Plano de Saúde", price: 200 },
      { id: 3, name: "Consórcio Imobiliário", price: 300 }
    ];
    res.json({ products });
  } catch (error) {
    console.error("Erro na rota /api/products:", error.stack);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// Rota para dados do usuário
app.get("/api/users/me", authMiddleware, async (req, res) => {
  try {
    const User = require("./models/User");
    const user = await User.findById(req.user.id).select("name email accountNumber balance");
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({
      name: user.name,
      email: user.email,
      accountNumber: user.accountNumber,
      balance: user.balance || 0
    });
  } catch (error) {
    console.error("Erro na rota /api/users/me:", error.stack);
    res.status(500).json({ error: "Erro interno ao buscar dados do usuário" });
  }
});

// Rotas estáticas
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/dashboard.html")));
app.get("/create-account", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/create-account.html")));
app.get("/recover-access", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/recover-access.html")));
app.get("/products-services", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/products-services.html")));

// Manipulação de erros
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));
app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Vasconcelos na porta ${PORT}`);
});