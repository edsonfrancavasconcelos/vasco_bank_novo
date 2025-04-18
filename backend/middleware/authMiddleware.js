// backend/middleware/authMiddleware.js
// Data: 18/04/2025
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Verifica se o header existe e começa com "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Erro: Header de autorização ausente ou inválido', { authHeader });
    return res.status(401).json({ error: 'Cabeçalho de autorização inválido' });
  }

  // Extrai o token
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Erro: Token não fornecido no cabeçalho');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  console.log('Token recebido:', token);

  try {
    // Valida o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.accountNumber) {
      console.log('Erro: Token não contém id ou accountNumber', { decoded });
      return res.status(401).json({ error: 'Token inválido: dados incompletos' });
    }

    // Salva os dados decodificados com id e _id pra compatibilidade
    req.user = { id: decoded.id, _id: decoded.id, accountNumber: decoded.accountNumber, email: decoded.email };
    console.log('Token validado, dados do usuário:', req.user);
    next();
  } catch (error) {
    console.error('Erro na validação do token:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(401).json({ error: 'Erro na autenticação' });
  }
};

module.exports = authMiddleware;