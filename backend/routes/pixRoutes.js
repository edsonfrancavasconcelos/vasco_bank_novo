const router = require('express').Router();
const {
  transferPix,
  payPix,
  chargePix,
  schedulePix,
  registerPixKey,
} = require('../controllers/pixController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/transfer', authMiddleware, transferPix);
router.post('/pay', authMiddleware, payPix);
router.post('/charge', authMiddleware, chargePix);
router.post('/schedule', authMiddleware, schedulePix);
router.post('/registerKey', authMiddleware, registerPixKey);

module.exports = router;