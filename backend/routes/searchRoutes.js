const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { identifier } = req.query;
    if (!identifier) {
      return res
        .status(400)
        .json({ message: "⚠️ CPF ou número da conta é obrigatório!" });
    }

    const user = await User.findOne({
      $or: [{ cpf: identifier }, { accountNumber: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "⚠️ Conta não encontrada!" });
    }

    res.status(200).json({
      fullName: user.fullName,
      cpf: user.cpf,
      accountNumber: user.accountNumber,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar conta:", error);
    res.status(500).json({ message: "❌ Erro interno do servidor" });
  }
});

module.exports = router;
