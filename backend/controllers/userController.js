const User = require("../models/User");
const bcrypt = require("bcrypt");

const userController = {
  createUser: async (req, res) => {
    try {
      const { fullName, cpf, email, password, phone } = req.body;

      if (!fullName || !cpf || !email || !password || !phone) {
        return res.status(400).json({ message: "Dados incompletos" });
      }

      const existingUser = await User.findOne({ $or: [{ cpf }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: "Usuário já existe" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        fullName,
        cpf,
        email,
        password: hashedPassword,
        phone,
      });

      await newUser.save();

      res.status(201).json({
        message: "Usuário criado com sucesso",
        user: {
          ...newUser.toObject(),
          password: undefined,
        },
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Erro de validação", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
  getUserByCpf: async (req, res) => {
    try {
      const user = await User.findOne({ cpf: req.params.cpf }).select(
        "-password"
      );
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário por CPF:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar perfil de usuário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  },
};

module.exports = userController;
