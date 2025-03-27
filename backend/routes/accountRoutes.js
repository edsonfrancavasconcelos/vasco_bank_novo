const express = require("express");
const { createAccount } = require("../controllers/accountController");
const router = express.Router();

router.post("/", createAccount); // Alterei de "/api/accounts" para "/" pois o prefixo é definido em app.js

module.exports = router;
const express = require("express");
const accountController = require("../controllers/accountController");

// Rota para criar uma conta
router.post("/register", accountController.createAccount);

// Rota para fazer login
router.post("/login", accountController.login);

module.exports = router;
