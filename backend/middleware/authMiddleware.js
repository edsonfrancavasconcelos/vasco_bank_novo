const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('Verificando token de autenticação para:', req.method, req.url);
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('Token não fornecido');
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const secret = process.env.JWT_SECRET || 'Edson@1';
    console.log('Usando chave secreta:', secret);

    const decoded = jwt.verify(token, secret);
    console.log('Token decodificado:', decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};