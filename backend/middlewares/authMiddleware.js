const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token recebido:", token);

    if (!token) {
      console.log("Token não encontrado.");
      return res.status(401).json({ message: "Token não encontrado" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        console.log("Token expirado.");
        return res.status(401).json({ message: "Token expirado" });
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        console.log("Token inválido.");
        return res.status(401).json({ message: "Token inválido" });
      } else {
        console.error("Erro ao verificar token:", jwtError);
        return res.status(401).json({ message: "Falha na autenticação" });
      }
    }

    console.log("Token decodificado:", decoded);

    if (!decoded.id) {
      console.log("ID do usuário não encontrado no token.");
      return res
        .status(401)
        .json({ message: "ID do usuário inválido no token" });
    }

    const user = await User.findById(decoded.id);
    console.log("Usuário encontrado:", user);

    if (!user) {
      console.log("Usuário não encontrado.");
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erro no middleware de autenticação:", error);
    res.status(500).json({ message: "Erro interno do servidor" }); // Melhor mensagem de erro genérica
  }
};

module.exports = authMiddleware;
