const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Acesso negado, token ausente!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: "Token inválido!" });
    }
};


const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Verifica se o header existe e começa com "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Usuário não autenticado ou token inválido" });
    }

    // Divide o header no espaço e pega a segunda parte (o token)
    const token = authHeader.split(" ")[1];

    try {
        // Valida o token com a chave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Salva os dados decodificados no req.user
        req.user = { id: decoded.id, accountNumber: decoded.accountNumber };
        next();
    } catch (error) {
        console.log("Erro na validação do token:", error.message); // Log pro debug
        return res.status(401).json({ error: "Usuário não autenticado ou token inválido" });
    }
};

module.exports = authMiddleware,authenticateToken; 