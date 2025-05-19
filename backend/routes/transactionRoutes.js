const router = require('express').Router();
const {
  transfer,
  deposit,
  withdraw,
  payBill,
  recharge,
  getTransactionHistory,
  getFinancialData,
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/transfer', authMiddleware, transfer);
router.post('/deposit', authMiddleware, deposit);
router.post('/withdraw', authMiddleware, withdraw);
router.post('/payBill', authMiddleware, payBill);
router.post('/recharge', authMiddleware, recharge);
router.get('/history', authMiddleware, getTransactionHistory);
router.get('/financial', authMiddleware, getFinancialData);
router.get('/statement/:accountNumber', authMiddleware, async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const user = await require('../models/User').findOne({ accountNumber });
    if (!user) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }
    const transactions = await require('../models/Transaction').find({ userId: user._id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Erro ao buscar extrato:', error.message);
    res.status(500).json({ error: 'Erro ao buscar extrato.' });
  }
});

module.exports = router;