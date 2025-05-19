const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

// Rotas
router.get('/', investmentController.getUserInvestments);
router.post('/', investmentController.createInvestment);

module.exports = router;