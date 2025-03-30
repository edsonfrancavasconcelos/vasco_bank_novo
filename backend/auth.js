const jwt = require("jsonwebtoken");
const User = require("./models/User");

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Header Authorization recebido:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Usuário não autenticado ou token inválido" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extraído:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Usuário decodificado no middleware:", decoded);

    let accountNumber = decoded.accountNumber;
    if (!accountNumber) {
      const user = await User.findById(decoded.id).select("accountNumber");
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }
      accountNumber = user.accountNumber;
    }

    req.user = { id: decoded.id, accountNumber };
    console.log("req.user no middleware:", req.user);

    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return res
      .status(401)
      .json({ error: "Usuário não autenticado ou token inválido" });
  }
};

module.exports = auth;
