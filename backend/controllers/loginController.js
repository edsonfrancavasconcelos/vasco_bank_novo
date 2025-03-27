// backend/controllers/loginController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "E-mail ou senha inválidos" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "E-mail ou senha inválidos" });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || "sua-chave-secreta-aqui"
    );
    res.status(200).json({ token });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

module.exports = { loginUser }; // Exporta explicitamente
