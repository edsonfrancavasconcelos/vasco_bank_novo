const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Extrai o token do cabeçalho Authorization
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token recebido:", token);

    // Verifica se o token foi fornecido
    if (!token) {
      console.log("Token não encontrado.");
      return res.status(401).json({ message: "Token não encontrado" });
    }

    let decoded;
    try {
      // Verifica e decodifica o token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decodificado:", decoded);
    } catch (jwtError) {
      // Trata erros específicos do JWT
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

    // Verifica se o token contém um ID de usuário válido
    if (!decoded.id) {
      console.log("ID do usuário não encontrado no token.");
      return res
        .status(401)
        .json({ message: "ID do usuário inválido no token" });
    }

    // Busca o usuário no banco de dados
    const user = await User.findById(decoded.id);
    console.log("Usuário encontrado:", user);

    // Verifica se o usuário existe
    if (!user) {
      console.log("Usuário não encontrado.");
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    // Adiciona o usuário à requisição para uso posterior
    req.user = user;
    next();
  } catch (error) {
    // Trata erros inesperados
    console.error("Erro no middleware de autenticação:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

module.exports = authMiddleware;
