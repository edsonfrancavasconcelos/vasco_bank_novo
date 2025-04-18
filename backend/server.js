// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config(); // Movido pro topo
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

console.log("authMiddleware:", authMiddleware); // Debug pro middleware

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

// Rotas
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes); // Linha 61
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

// Rota para cotações
app.get("/api/quotes", authMiddleware, async (req, res) => {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";
    const symbols = ["BRLUSD", "BRLBTC"];
    const quotes = {};

    for (const symbol of symbols) {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol.slice(0, 3)}&to_currency=${symbol.slice(3)}&apikey=${apiKey}`
      );
      const data = response.data["Realtime Currency Exchange Rate"];
      if (data) {
        quotes[symbol] = {
          rate: parseFloat(data["5. Exchange Rate"]),
          updated: data["6. Last Refreshed"]
        };
      }
    }

    res.json({ quotes });
  } catch (error) {
    console.error("Erro na rota /api/quotes:", error.stack);
    res.status(500).json({ error: "Erro ao buscar cotações" });
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
app.use((req, res, next) => res.status(404).json({ error: "Rota não encontrada" }));
app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Vasconcelos na porta ${PORT}`);
});