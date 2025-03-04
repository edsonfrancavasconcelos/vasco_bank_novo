const User = require("../models/User");
const express = require("express");
const router = express.Router();

const getUserProfile = async (req, res) => {
  try {
    // O usuário já foi autenticado pelo authMiddleware e está disponível em req.user
    const user = req.user;

    // Retorna as informações do perfil do usuário
    res.json({
      fullName: user.fullName,
      email: user.email,
      balance: user.balance,
    });
  } catch (error) {
    console.error("Erro ao obter perfil do usuário:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = { getUserProfile };
