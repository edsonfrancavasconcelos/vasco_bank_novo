// userController.js
const User = require("../models/User");
const mongoose = require("mongoose"); // Importe mongoose para erros específicos

const getUserProfile = async (req, res) => {
  try {
    console.log("req.user em getUserProfile:", req.user); // Log de depuração

    if (!req.user || !req.user._id) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não autenticado" });
    }

    const userId = req.user._id;

    // Use projeção para selecionar campos específicos
    const user = await User.findById(userId, "nome email");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });
    }

    res.json({
      success: true,
      data: {
        nome: user.nome,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erro em getUserProfile:", error);

    if (error instanceof mongoose.CastError) {
      return res
        .status(400)
        .json({ success: false, message: "ID de usuário inválido" });
    }

    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor" });
  }
};

module.exports = {
  getUserProfile,
};
