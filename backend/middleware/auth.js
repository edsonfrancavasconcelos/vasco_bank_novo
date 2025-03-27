const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Acesso negado, token não fornecido" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sua-chave-secreta-aqui"
    );
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    req.user = {
      id: decoded.id,
      accountNumber: user.accountNumber,
    };
    console.log("Usuário autenticado:", req.user); // Log pra debug
    next();
  } catch (error) {
    console.error("Erro ao verificar token ou buscar usuário:", error);
    res.status(403).json({ error: "Token inválido ou erro no servidor" });
  }
}

module.exports = authenticateToken;
