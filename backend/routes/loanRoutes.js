const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Routes
router.get('/', loanController.getUserLoans);
router.post('/', loanController.createLoan);

module.exports = router;