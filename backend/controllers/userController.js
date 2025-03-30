const jwt = require("jsonwebtoken");
const User = require("../models/User");

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body; // Muda de identifier pra email
        const user = await User.findOne({ email }); // Busca só por email
        if (!user) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }
        if (!(await user.comparePassword(password))) {
            return res.status(401).json({ error: "Senha inválida" });
        }
        const token = jwt.sign(
            { id: user._id, accountNumber: user.accountNumber },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(200).json({ token });
    } catch (error) {
        console.error("Erro ao fazer login:", error.message);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
};
const getTransactionHistory = async (req, res) => {
  try {
      const userId = req.user.id; // Vem do middleware de autenticação
      const transactions = await Transaction.find({ $or: [{ fromAccount: userId }, { targetAccount: userId }] });
      res.status(200).json(transactions);
  } catch (error) {
      console.error("Erro ao buscar histórico:", error.message);
      res.status(500).json({ error: "Erro ao carregar histórico" });
  }
};
// Resto do código (registerUser, getUserInfo, etc.) fica igual
module.exports = {
    registerUser,
    loginUser,
    getUserInfo,
    getUserByAccountNumber,
    getTransactionHistory
};