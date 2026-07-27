const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  coinId: {
    type: String,
    required: [true, 'Coin ID is required']
  },
  coinSymbol: {
    type: String,
    required: true
  },
  coinName: {
    type: String,
    required: true
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

// Create a compound index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, coinId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
