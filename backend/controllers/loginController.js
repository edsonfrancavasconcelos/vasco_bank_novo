const User = require('../models/User');

// Login de usuário
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verifica se os campos foram preenchidos
    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor, forneça email e senha.' });
    }

    // Busca o usuário pelo email
    const user = await User.findOne({ email });

    // Verifica se o usuário existe e se a senha está correta
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({ message: 'Login bem-sucedido', user });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro ao efetuar login:', error);
    res.status(500).json({ error: 'Erro ao efetuar login' });
  }
};
