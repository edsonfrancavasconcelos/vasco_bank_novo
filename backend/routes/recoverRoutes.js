const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  const { email } = req.body;
  // Lógica para enviar e-mail de recuperação (ex.: usando nodemailer)
  res.status(200).json({ message: 'Instruções enviadas.' });
});

module.exports = router;