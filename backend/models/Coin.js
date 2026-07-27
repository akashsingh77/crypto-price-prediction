const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide coin name'],
    trim: true
  },
  symbol: {
    type: String,
    required: [true, 'Please provide coin symbol'],
    uppercase: true,
    unique: true
  },
  currentPrice: {
    type: Number,
    required: [true, 'Please provide current price'],
    default: 0
  },
  marketCap: {
    type: Number,
    default: 0
  },
  volume24h: {
    type: Number,
    default: 0
  },
  change24h: {
    type: Number,
    default: 0
  },
  change7d: {
    type: Number,
    default: 0
  },
  change30d: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  rank: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
coinSchema.index({ symbol: 1 });
coinSchema.index({ name: 'text' });

module.exports = mongoose.model('Coin', coinSchema);
