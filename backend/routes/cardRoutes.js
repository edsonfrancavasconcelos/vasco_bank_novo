const router = require('express').Router();
const {
  createCard,
  createVirtualCard,
  replacePhysicalCard,
  activateCard,
  unlockCard,
  getCards
} = require('../controllers/cardController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createCard);
router.post('/virtual', authMiddleware, createVirtualCard);
router.post('/replace', authMiddleware, replacePhysicalCard);
router.post('/activate', authMiddleware, activateCard);
router.post('/unlock', authMiddleware, unlockCard);
router.get('/', authMiddleware, getCards);

module.exports = router;