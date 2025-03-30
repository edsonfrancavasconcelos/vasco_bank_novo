const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
          console.error("Erro na verificação do token:", err.message);
          return res.status(403).json({ error: "Token inválido ou expirado" });
      }
      req.user = user;
      console.log("Usuário autenticado:", user);
      next();
  });
};
