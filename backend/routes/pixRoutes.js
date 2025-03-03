const express = require('express');
const { makePix } = require('../controllers/pixController'); // Certifique-se de que este caminho está correto

const router = express.Router();

// Rota para realizar Pix
router.post('/', makePix); // Verifique se makePix está definido e exportado corretamente

module.exports = router;
