const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, async (req, res) => {
  const { phoneNumber, amount } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (user.balance < amount) {
      return res.status(400).json({ error: "Saldo insuficiente." });
    }

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      accountId: user._id,
      type: "Recarga de Celular",
      amount: -amount,
      details: `Recarga para ${phoneNumber}`,
    });
    await transaction.save();

    res.status(200).json({ message: "Recarga realizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar recarga." });
  }
});

module.exports = router;
