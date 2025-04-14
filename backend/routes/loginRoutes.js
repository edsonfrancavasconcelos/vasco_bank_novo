const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Certifique-se de carregar as variáveis de ambiente

router.post("/", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) { // Ajusta pra bcrypt se tiver hash
        return res.status(401).json({ error: "Credenciais inválidas" });
    }
    const token = jwt.sign({ id: user._id }, "vasco_bank_secret", { expiresIn: "1h" });
    res.json({ token });
});

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Usuário ou senha incorretos" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Usuário ou senha incorretos" });
    }

    const tokenPayload = {
      id: user._id.toString(),
      accountNumber: user.accountNumber,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login bem-sucedido",
      token,
      fullName: user.fullName,
      accountNumber: user.accountNumber,
      balance: user.balance,
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno ao processar login" });
  }
});

module.exports = router;
