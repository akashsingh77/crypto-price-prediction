const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  coins: [{
    coinId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coin',
      required: true
    },
    coinSymbol: {
      type: String,
      required: true
    },
    coinName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    },
    averageBuyPrice: {
      type: Number,
      required: true,
      default: 0
    },
    currentValue: {
      type: Number,
      default: 0
    },
    profitLoss: {
      type: Number,
      default: 0
    },
    profitLossPercentage: {
      type: Number,
      default: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalInvestment: {
    type: Number,
    default: 0
  },
  currentPortfolioValue: {
    type: Number,
    default: 0
  },
  totalProfitLoss: {
    type: Number,
    default: 0
  },
  totalProfitLossPercentage: {
    type: Number,
    default: 0
  },
  cash: {
    type: Number,
    default: 100000
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

// Index for better query performance
portfolioSchema.index({ userId: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
