require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");
const authMiddleware = require("./middlewares/authMiddleware");
const authController = require("./controllers/authController");

const app = express();

// Configuração de CORS
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Conectar ao banco de dados
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI não definida no .env");
    }
    await mongoose.connect(mongoURI, {});
    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    process.exit(1);
  }
};

connectDB();

// Autenticação
app.post("/login", authController.login);

// Rota protegida
app.get("/protegido", authMiddleware, (req, res) => {
  res.json({ message: "Rota protegida acessada com sucesso", user: req.user });
});

app.get("/api/users/me", authMiddleware, (req, res) => {
  res.json({ fullName: req.user.usuario, balance: 1000 });
});

// Importação das rotas
const accountRoutes = require("./routes/accountRoutes");
const cardRoutes = require("./routes/cardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const pixRoutes = require("./routes/pixRoutes");
const userRoutes = require("./routes/userRoutes");

// Rotas da API
app.use("/api/accounts", accountRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pix", pixRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;

// Iniciar o servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Tratamento de erros do servidor
server.on("error", (err) => {
  console.error("❌ Erro ao iniciar o servidor:", err);
});

// Tratamento de encerramento do servidor
process.on("SIGINT", () => {
  console.log("Servidor encerrando...");
  server.close(() => {
    mongoose.connection.close().then(() => {
      console.log("✅ Conexão com o MongoDB fechada.");
      process.exit(0);
    });
  });
});
