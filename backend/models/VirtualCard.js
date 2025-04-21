const mongoose = require('mongoose');

const virtualCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  number: {
    type: String,
    required: true
  },
  lastFour: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true
  },
  expiry: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['single-use', 'multi-use'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VirtualCard', virtualCardSchema);