const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { usuario, senha } = req.body;

  // Verifica se os campos foram fornecidos
  if (!usuario || !senha) {
    console.log("Campos 'usuario' e 'senha' são obrigatórios.");
    return res
      .status(400)
      .json({ message: "Campos 'usuario' e 'senha' são obrigatórios." });
  }

  // Simulação de banco de dados (em um cenário real, use um banco de dados)
  const users = {
    usuario: "senha", // Em um cenário real, use bcrypt para armazenar senhas com hash
  };

  // Verifica se o usuário existe e se a senha está correta
  if (users[usuario] && users[usuario] === senha) {
    // Gera o token JWT
    const token = jwt.sign({ usuario }, process.env.SEU_SEGREDO_JWT, {
      expiresIn: "1h", // Token expira em 1 hora
    });

    console.log("Login bem-sucedido para o usuário:", usuario);
    res.json({ token });
  } else {
    console.log("Credenciais inválidas para o usuário:", usuario);
    res.status(401).json({ message: "Credenciais inválidas" });
  }
};

module.exports = { login };
