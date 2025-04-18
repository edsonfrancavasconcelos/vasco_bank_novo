const express = require("express");
const router = express.Router();
const { login, register, checkAuth } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware"); // Corrigido aqui

router.post("/login", login);
router.post("/register", register); // Opcional
router.get("/check", authMiddleware, checkAuth); // Opcional

module.exports = router;
