const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const loginRoutes = require("./routes/loginRoutes");
const cardRoutes = require("./routes/cardRoutes");
const pixRoutes = require("./routes/pixRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const { getTransactionHistory } = require("./controllers/transactionController");

const app = express();

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
app.use("/api/transactions", authMiddleware, transactionRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/pix", authMiddleware, pixRoutes);
app.get("/api/transactions/history", authMiddleware, getTransactionHistory);

// Rota para dados do usuário
app.get("/api/user", authMiddleware, async (req, res) => {
    try {
        const User = require("./models/User");
        const user = await User.findById(req.user.id).select("name accountNumber balance");
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
        res.json({ user: { name: user.name, accountNumber: user.accountNumber, balance: user.balance || 0 } });
    } catch (error) {
        console.error("Erro na rota /api/user:", error);
        res.status(500).json({ error: "Erro interno ao buscar dados do usuário" });
    }
});

// Rota para dados financeiros
app.get("/api/financial", authMiddleware, async (req, res) => {
    try {
        const Card = require("./models/Card");
        const Loan = require("./models/Loan");
        const card = await Card.findOne({ userId: req.user.id }) || { invoice: 0 };
        const loans = await Loan.find({ userId: req.user.id, type: "personal" });
        const consigned = await Loan.find({ userId: req.user.id, type: "consigned" });
        res.json({
            card: { invoice: card.invoice || 0 },
            loans: loans.map(l => ({ amount: l.amount })),
            consigned: consigned.map(c => ({ amount: c.amount })),
        });
    } catch (error) {
        console.error("Erro na rota /api/financial:", error);
        res.status(500).json({ error: "Erro interno ao buscar dados financeiros" });
    }
});

// Rotas estáticas
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/dashboard.html")));
app.get("/create-account", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/create-account.html")));

// Erros
app.use((req, res, next) => res.status(404).json({ error: "Rota não encontrada" }));
app.use((err, req, res, next) => {
    console.error("Erro no servidor:", err.stack);
    res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Vasconcelos na porta ${PORT}`);
});