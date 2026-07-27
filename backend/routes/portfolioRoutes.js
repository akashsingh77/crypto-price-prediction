const express = require('express');
const {
  getPortfolio,
  addCoin,
  buyCoin,
  sellCoin,
  getPortfolioSummary
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Portfolio routes
router.get('/', getPortfolio);
router.get('/summary', getPortfolioSummary);
router.post('/add-coin', addCoin);
router.post('/buy', buyCoin);
router.post('/sell', sellCoin);

module.exports = router;
