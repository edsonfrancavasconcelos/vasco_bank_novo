const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  cardType: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  holderName: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: String, // Formato MM/AA
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Card', cardSchema);