const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  coinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coin',
    required: [true, 'Coin ID is required']
  },
  coinSymbol: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  predictedPrice: {
    type: Number,
    required: [true, 'Predicted price is required']
  },
  actualPrice: {
    type: Number,
    default: null
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: [true, 'Confidence level is required']
  },
  recommendation: {
    type: String,
    enum: ['Buy', 'Sell', 'Hold'],
    required: [true, 'Recommendation is required']
  },
  predictionDate: {
    type: Date,
    required: [true, 'Prediction date is required']
  },
  expiryDate: {
    type: Date,
    required: true
  },
  accuracy: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
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
predictionSchema.index({ userId: 1, predictionDate: -1 });
predictionSchema.index({ coinId: 1 });
predictionSchema.index({ status: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
