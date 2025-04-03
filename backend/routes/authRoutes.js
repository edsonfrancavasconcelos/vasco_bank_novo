const express = require("express");
const router = express.Router();
const { login, register, checkAuth } = require("../controllers/authController");
const authMiddleware = require"../middleware/authMiddleware"); // O auth.js que a gente ajustou

router.post("/login", login);
router.post("/register", register); // Opcional
router.get("/check", authMiddleware, checkAuth); // Opcional

module.exports = router;
