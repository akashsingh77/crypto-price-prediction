const express = require('express');
const {
  createTransaction,
  getTransactionHistory,
  getTransaction,
  getTransactionStats
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Transaction routes
router.post('/', createTransaction);
router.get('/', getTransactionHistory);
router.get('/stats', getTransactionStats);
router.get('/:id', getTransaction);

module.exports = router;
