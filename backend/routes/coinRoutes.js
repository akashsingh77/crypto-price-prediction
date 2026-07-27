const express = require('express');
const {
  getCoins,
  getCoinById,
  getCoinBySymbol,
  getTrendingCoins,
  getTopGainers,
  getTopLosers,
  searchCoins,
  getHistoricalPrices,
  createCoin,
  updateCoin
} = require('../controllers/coinController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getCoins);
router.get('/trending', getTrendingCoins);
router.get('/gainers', getTopGainers);
router.get('/losers', getTopLosers);
router.get('/search/:query', searchCoins);
router.get('/symbol/:symbol', getCoinBySymbol);
router.get('/:id/history', getHistoricalPrices);
router.get('/:id', getCoinById);

// Admin routes
router.post('/', protect, createCoin);
router.put('/:id', protect, updateCoin);

module.exports = router;
