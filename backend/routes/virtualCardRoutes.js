const express = require('express');
const router = express.Router();
const VirtualCard = require('../models/VirtualCard');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {
  try {
    console.log('Buscando cartões para userId:', req.user.id); // Log para depuração
    const cards = await VirtualCard.find({ userId: req.user.id });
    console.log('Cartões encontrados:', cards); // Log para depuração
    res.json(cards);
  } catch (err) {
    console.error('Erro ao buscar cartões:', err); // Log detalhado do erro
    res.status(500).json({ error: 'Erro ao buscar cartões' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Excluindo cartão ID:', req.params.id, 'para userId:', req.user.id); // Log para depuração
    const card = await VirtualCard.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!card) return res.status(404).json({ error: 'Cartão não encontrado' });
    res.json({ message: 'Cartão excluído' });
  } catch (err) {
    console.error('Erro ao excluir cartão:', err); // Log detalhado do erro
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

module.exports = router;