const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Verifica se o header existe e começa com "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("Erro: Header de autorização ausente ou inválido");
        return res.status(401).json({ error: "Usuário não autenticado ou token inválido" });
    }

    // Divide o header no espaço e pega a segunda parte (o token)
    const token = authHeader.split("")[1];
    try {
        // Valida o token com a chave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "vasco_bank_secret");
        // Salva os dados decodificados no req.user
        req.user = { id: decoded.id, accountNumber: decoded.accountNumber };
        console.log("Token validado com sucesso, user:", req.user);
        next();
    } catch (error) {
        console.log("Erro na validação do token:", error.message);
        return res.status(401).json({ error: "Usuário não autenticado ou token inválido" });
    }
};

module.exports = authMiddleware;