const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getUserInfo,
  getUserByAccountNumber,
} = require("../controllers/userController");
const { body, validationResult } = require("express-validator");

// Rota de registro de usuário
router.post(
  "/register",
  [
    body("fullName").notEmpty().withMessage("Nome completo é obrigatório"),
    body("email").isEmail().withMessage("E-mail inválido"),
    body("cpf")
      .isLength({ min: 11, max: 11 })
      .withMessage("CPF deve ter 11 dígitos"),
    body("rg").notEmpty().withMessage("RG é obrigatório"),
    body("address").notEmpty().withMessage("Endereço é obrigatório"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Senha deve ter pelo menos 6 caracteres"),
    body("initialBalance")
      .isFloat({ min: 0 })
      .withMessage("Saldo inicial deve ser um número positivo")
      .optional({ nullable: true }), // Torna opcional, default será 0
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Erros de validação:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("Validação passou:", req.body);
    next();
  },
  registerUser
);

// Rota de login
router.post("/login", loginUser);

// Rota para dados do usuário logado
router.get("/me", authenticateToken, getUserInfo);

// Rota para buscar usuário por número da conta
router.get(
  "/account/:accountNumber",
  authenticateToken,
  getUserByAccountNumber
);

module.exports = router;
