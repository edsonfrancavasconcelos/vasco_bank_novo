// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

// Rota protegida para obter o perfil do usuário
router.get("/me", authMiddleware, userController.getUserProfile);

module.exports = router;
