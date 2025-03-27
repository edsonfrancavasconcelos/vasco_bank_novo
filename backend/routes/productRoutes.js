const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const products = [
    { name: 'Cartão de Crédito', description: 'Sem anuidade e com cashback.' },
    { name: 'Conta Digital', description: 'Gerencie seu dinheiro online.' },
  ]; // Exemplo estático
  res.status(200).json(products);
});

module.exports = router;