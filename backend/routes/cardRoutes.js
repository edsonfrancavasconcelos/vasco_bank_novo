const router = require("express").Router();
const { createCard } = require("../controllers/cardController");
const authMiddleware = require("../middleware/auth"); // Middleware de autenticação

router.post("/create", authMiddleware, createCard); // POST com autenticação

module.exports = router;
