const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"
  console.log("Token recebido:", token); // Debug

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, process.env.JWT_SECRET || "segredo", (err, user) => {
    if (err) {
      console.log("Erro ao verificar token:", err); // Debug
      return res.status(403).json({ error: "Token inválido" });
    }
    console.log("Usuário decodificado:", user); // Debug
    req.user = user; // Tem que setar isso
    next();
  });
}

module.exports = authenticateToken;
