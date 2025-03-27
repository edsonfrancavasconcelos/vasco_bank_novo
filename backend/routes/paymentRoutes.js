const express = require("express");
const router = express.Router();

// Exemplo de rota básica
router.get("/payment", (req, res) => {
  res.json({ message: "Rota de pagamento funcionando" });
});

module.exports = router;
