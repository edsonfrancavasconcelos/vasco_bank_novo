// backend/routes/loginRoutes.js
const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/userController");
const { body, validationResult } = require("express-validator");

// Rota POST para login
router.post(
  "/",
  [
    body("email").isEmail().withMessage("E-mail inválido"),
    body("password").notEmpty().withMessage("Senha é obrigatória"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  loginUser
);

module.exports = router;
