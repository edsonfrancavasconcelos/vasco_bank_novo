// controllers/authController.js
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { usuario, senha } = req.body;
  const users = {
    usuario: "usuario",
    senha: "senha",
  };

  if (users[usuario] && users[usuario] === senha) {
    const token = jwt.sign({ usuario }, process.env.SEU_SEGREDO_JWT, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Credenciais inválidas" });
  }
};

module.exports = { login };
