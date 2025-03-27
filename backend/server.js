const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken"); // Adiciona o JWT
require("dotenv").config();
const routes = require("./routes/index");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend/pages")));
app.use("/js", express.static(path.join(__dirname, "../frontend/js")));
// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token não fornecido" });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido ou expirado" });
    req.user = user;
    console.log("Usuário decodificado no middleware:", user); // Adiciona esse log
    next();
  });
};


// Conexão com MongoDB
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/vasco_bank";
mongoose
  .connect(mongoURI, {})
  .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB Atlas:", err));

// Rotas da API (com autenticação onde necessário)
app.use("/api/users", routes.userRoutes);
app.use("/api/transactions", authenticateToken, routes.transactionRoutes); // Aplica o middleware aqui
console.log(
  "Rotas de transações carregadas:",
  routes.transactionRoutes.stack.map((r) => r.route.path)
);
app.use("/api/login", routes.loginRoutes);

// Rotas de páginas estáticas depois
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/pages/index.html"))
);
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/pages/login.html"))
);
app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/pages/dashboard.html"))
);
app.get("/create-account", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/pages/create-account.html"))
);

// Middleware para rotas não encontradas
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada" }));

// Middleware para erros internos
app.use((err, req, res, next) => {
  console.error("Erro no servidor:", err.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor Vasconcelos na porta ${PORT}`));