const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { registerUser, loginUser, getUserInfo, getUserByAccountNumber } = require("../controllers/userController");
const { body, validationResult } = require("express-validator");

// Função simplificada pra validar CPF
const validarCPF = (cpf) => {
    const cleanedCpf = String(cpf).replace(/[^\d]/g, ""); // Converte pra string e remove não-dígitos
    console.log("CPF recebido no backend:", cleanedCpf); // Log pra debug
    console.log("Tamanho do CPF:", cleanedCpf.length); // Log do tamanho
    return cleanedCpf.length === 11; // Só verifica se tem 11 dígitos
};

// Validação de entrada
const validateUserInput = [
    body("fullName").notEmpty().withMessage("Nome completo é obrigatório"),
    body("email").isEmail().withMessage("E-mail inválido"),
    body("cpf")
        .custom(validarCPF)
        .withMessage("CPF deve ter exatamente 11 dígitos"),
    body("rg").notEmpty().withMessage("RG é obrigatório"),
    body("address").notEmpty().withMessage("Endereço é obrigatório"),
    body("password")
        .isLength({ min: 6 })
        .withMessage("Senha deve ter pelo menos 6 caracteres"),
    body("initialBalance")
        .isFloat({ min: 0 })
        .withMessage("Saldo inicial deve ser um número positivo")
        .optional({ nullable: true }),
];

// Middleware de validação
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Erros de validação:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    console.log("Validação passou com sucesso!");
    next();
};

// Rotas
router.post("/register", validateUserInput, validateRequest, registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getUserInfo);
router.get("/account/:accountNumber", authMiddleware, getUserByAccountNumber);

module.exports = router;