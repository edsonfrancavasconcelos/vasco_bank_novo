const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

router.get("/:accountId", authMiddleware, async (req, res) => {
  // Lógica para buscar histórico no banco de dados
  const transactions = [
    {
      date: new Date(),
      type: "Pix",
      amount: 100.0,
      details: "Pagamento a João",
    },
    { date: new Date(), type: "Depósito", amount: 500.0 },
  ]; // Exemplo estático
  res.status(200).json(transactions);
});

module.exports = router;
