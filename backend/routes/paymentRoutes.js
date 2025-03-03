const express = require('express');
const { makePayment } = require('../controllers/makePaymentController'); // Certifique-se de que o nome do controlador está correto

const router = express.Router();

// Rota para realizar pagamento
router.post('/pay', makePayment);

module.exports = router;
