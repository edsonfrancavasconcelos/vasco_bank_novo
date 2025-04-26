const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const loginRoutes = require("./routes/loginRoutes");
const cardRoutes = require("./routes/cardRoutes");
const pixRoutes = require("./routes/pixRoutes");
const loanRoutes = require("./routes/loanRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const virtualCardRoutes = require('./routes/virtualCardRoutes');
const authMiddleware = require("./middleware/authMiddleware");
const VirtualCard = require("./models/VirtualCard"); // Adicionado para corrigir ReferenceError
const {
  getTransactionHistory,
} = require("./controllers/transactionController");
const quotesIntegration = require("./quotes_integration");

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
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.static(path.join(__dirname, "../frontend/pages")));

// MongoDB
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/vasco_bank";
console.log("Mongo URI:", mongoURI.replace(/:([^:@]+)@/, ":****@"));
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
  const firstSix = "411111";
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
app.use('/api/virtualCards', authMiddleware, virtualCardRoutes);

// Rota para histórico de transações
app.get("/api/transactions/history", authMiddleware, getTransactionHistory);

// Rota para cotações em tempo real
app.get("/api/quotes", authMiddleware, async (req, res) => {
  try {
    if (typeof quotesIntegration.getQuotes === "function") {
      await quotesIntegration.getQuotes(req, res);
    } else {
      throw new Error("Função getQuotes não implementada");
    }
  } catch (err) {
    console.error("Erro ao buscar cotações:", err.stack);
    res.status(500).json({ error: "Erro ao buscar cotações" });
  }
});

// Rota para criar cartão virtual
app.post("/api/virtual-cards", authMiddleware, async (req, res) => {
  try {
    const { limit, type } = req.body;
    const userId = req.user.id;
    if (!limit || !type || !["single-use", "multi-use"].includes(type)) {
      return res
        .status(400)
        .json({
          error: "Limite e tipo são obrigatórios (single-use ou multi-use)",
        });
    }

    const number = generateCardNumber();
    const lastFour = number.slice(-4);
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const expiry = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-GB")
      .split("/")
      .reverse()
      .join("/");

    const card = new VirtualCard({
      userId,
      number,
      lastFour,
      cvv,
      expiry,
      limit,
      type,
      status: "active",
    });

    await card.save();
    res.status(201).json({
      _id: card._id,
      lastFour,
      expiry,
      limit,
      type,
      status: "active",
    });
  } catch (error) {
    console.error("Erro ao criar cartão virtual:", error);
    res.status(500).json({ error: "Erro ao criar cartão virtual" });
  }
});

// Rota para listar cartões virtuais
app.get("/api/virtual-cards", authMiddleware, async (req, res) => {
  try {
    const cards = await VirtualCard.find({ userId: req.user.id });
    res.json(
      cards.map((card) => ({
        _id: card._id,
        lastFour: card.lastFour,
        expiry: card.expiry,
        limit: card.limit,
        type: card.type,
        status: card.status,
      }))
    );
  } catch (error) {
    console.error("Erro ao listar cartões virtuais:", error);
    res.status(500).json({ error: "Erro ao listar cartões virtuais" });
  }
});

// Rota para excluir cartão virtual
app.delete("/api/virtual-cards/:id", authMiddleware, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.id;
    const card = await VirtualCard.findOneAndDelete({ _id: cardId, userId });
    if (!card) {
      return res
        .status(404)
        .json({ error: "Cartão não encontrado ou não pertence ao usuário" });
    }
    res.json({ message: "Cartão virtual excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cartão virtual:", error);
    res.status(500).json({ error: "Erro ao excluir cartão virtual" });
  }
});

// Rota de fallback para páginas não encontradas
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));