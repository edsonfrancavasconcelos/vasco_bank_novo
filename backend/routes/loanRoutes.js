const router = require('express').Router();
const { requestLoan } = require('../controllers/loanController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/request', authMiddleware, requestLoan);

module.exports = router;