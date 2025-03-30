const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const loginRoutes = require("./routes/loginRoutes");
const authMiddleware = require("./middleware/authMiddleware"); // Usar só esse

const app = express();

// Middleware para parsing de JSON e URL encoded
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, "../frontend/pages")));

// Conexão com MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/vasco_bank";
mongoose
    .connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
    .catch((err) => console.error("Erro ao conectar ao MongoDB Atlas:", err));

// Rotas da API
app.use("/api/users", userRoutes);
app.use("/api/transactions", authMiddleware, transactionRoutes); // Usa authMiddleware aqui
app.use("/api/login", loginRoutes);

// Rotas de páginas estáticas
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/dashboard.html")));
app.get("/create-account", (req, res) => res.sendFile(path.join(__dirname, "../frontend/pages/create-account.html")));
app.get("/api/transactions/history", authMiddleware, getTransactionHistory);

// Middleware para rotas não encontradas
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));

// Middleware para erros internos
app.use((err, req, res, next) => {
    console.error("Erro no servidor:", err.stack);
    res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Vasconcelos na porta ${PORT}`));