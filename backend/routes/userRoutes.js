const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { loginUser, getUserInfo, getUserByAccountNumber } = require("../controllers/userController"); // Removi registerUser da importação
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // Adicionei o modelo User explicitamente

// Função local renomeada pra evitar conflito
async function registerNewUser(req, res) {
    const { fullName, email, cpf, rg, address, password, initialBalance } = req.body;

    try {
        const accountNumber = Math.random().toString().slice(2, 11);

        const existingUser = await User.findOne({ $or: [{ email }, { cpf }] });
        if (existingUser) {
            return res.status(400).json({ error: "E-mail ou CPF já cadastrado" });
        }

        const user = new User({
            fullName,
            email,
            cpf,
            rg,
            address,
            password, // Será hasheado pelo pre-save
            accountNumber,
            balance: initialBalance || 0,
            pixKeys: []
        });

        await user.save();
        res.status(201).json({ message: "Conta criada com sucesso", accountNumber });
    } catch (error) {
        console.error("Erro detalhado ao registrar usuário:", error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "E-mail, CPF ou número de conta já existe" });
        }
        if (error.code === "ECONNRESET" || error.name === "MongoNetworkError") {
            return res.status(503).json({ error: "Erro de conexão com o banco de dados, tente novamente" });
        }
        res.status(500).json({ error: "Erro ao criar conta" });
    }
}

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
router.post("/register", validateUserInput, validateRequest, registerNewUser); // Usa a função local renomeada
router.post("/login", loginUser);
router.get("/me", authMiddleware, getUserInfo);
router.get("/account/:accountNumber", authMiddleware, getUserByAccountNumber);

module.exports = router;