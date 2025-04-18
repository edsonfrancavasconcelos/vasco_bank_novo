const router = require('express').Router();
const { invest } = require('../controllers/investmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/invest', authMiddleware, invest);

module.exports = router;