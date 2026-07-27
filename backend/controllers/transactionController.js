const Transaction = require('../models/Transaction');
const Coin = require('../models/Coin');
const Portfolio = require('../models/Portfolio');
const { isValidObjectId, isValidTransactionType } = require('../utils/validation');

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
exports.createTransaction = async (req, res, next) => {
  try {
    const { coinId, type, quantity, price, fee = 0 } = req.body;

    // Validation
    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    if (!isValidTransactionType(type)) {
      return res.status(400).json({ message: 'Transaction type must be BUY or SELL' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    // Get coin details
    const coin = await Coin.findById(coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    const totalAmount = quantity * price;
    const netAmount = type === 'BUY' ? totalAmount + fee : totalAmount - fee;

    // Get or create portfolio
    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user.id });
    }

    // Check cash availability for buy transactions
    if (type === 'BUY' && portfolio.cash < netAmount) {
      return res.status(400).json({ 
        message: `Insufficient funds for purchase. Required: $${netAmount}, Available: $${portfolio.cash}` 
      });
    }

    // Check quantity availability for sell transactions
    if (type === 'SELL') {
      const portfolioCoin = portfolio.coins.find(c => c.coinId.toString() === coinId);
      if (!portfolioCoin || portfolioCoin.quantity < quantity) {
        const available = portfolioCoin ? portfolioCoin.quantity : 0;
        return res.status(400).json({ 
          message: `Insufficient coins to sell. Have: ${available}, Trying to sell: ${quantity}` 
        });
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user.id,
      coinId,
      coinSymbol: coin.symbol,
      coinName: coin.name,
      type,
      quantity,
      price,
      totalAmount,
      fee,
      netAmount,
      transactionDate: new Date(),
      status: 'completed'
    });

    // Update portfolio
    if (type === 'BUY') {
      const existingCoin = portfolio.coins.find(c => c.coinId.toString() === coinId);
      
      if (existingCoin) {
        const newTotalCost = (existingCoin.quantity * existingCoin.averageBuyPrice) + totalAmount;
        const newQuantity = existingCoin.quantity + quantity;
        existingCoin.averageBuyPrice = newTotalCost / newQuantity;
        existingCoin.quantity = newQuantity;
      } else {
        portfolio.coins.push({
          coinId,
          coinSymbol: coin.symbol,
          coinName: coin.name,
          quantity,
          averageBuyPrice: price,
          currentValue: totalAmount
        });
      }
      portfolio.cash -= netAmount;
      portfolio.totalInvestment += totalAmount;
    } else {
      const coinIndex = portfolio.coins.findIndex(c => c.coinId.toString() === coinId);
      if (coinIndex !== -1) {
        const portfolioCoin = portfolio.coins[coinIndex];
        portfolioCoin.quantity -= quantity;

        if (portfolioCoin.quantity === 0) {
          portfolio.coins.splice(coinIndex, 1);
        }
      }
      portfolio.cash += netAmount;
    }

    // Recalculate portfolio values
    portfolio.coins.forEach(c => {
      c.currentValue = c.quantity * coin.currentPrice;
      c.profitLoss = c.currentValue - (c.quantity * c.averageBuyPrice);
      c.profitLossPercentage = (c.profitLoss / (c.quantity * c.averageBuyPrice)) * 100;
    });

    portfolio.currentPortfolioValue = portfolio.coins.reduce((sum, c) => sum + c.currentValue, 0);
    portfolio.totalProfitLoss = portfolio.coins.reduce((sum, c) => sum + c.profitLoss, 0);
    portfolio.totalProfitLossPercentage = portfolio.totalInvestment > 0 
      ? (portfolio.totalProfitLoss / portfolio.totalInvestment) * 100 
      : 0;

    await portfolio.save();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transaction history
// @route   GET /api/transactions
// @access  Private
exports.getTransactionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, coinId, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };
    if (type && isValidTransactionType(type)) query.type = type;
    if (coinId && isValidObjectId(coinId)) query.coinId = coinId;
    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort({ transactionDate: -1 })
      .limit(limit * 1)
      .skip(skip)
      .populate('coinId', 'name symbol');

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await Transaction.findById(id).populate('coinId', 'name symbol');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check authorization
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
exports.getTransactionStats = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    const stats = {
      totalTransactions: transactions.length,
      totalBuys: transactions.filter(t => t.type === 'BUY').length,
      totalSells: transactions.filter(t => t.type === 'SELL').length,
      totalBuyAmount: transactions
        .filter(t => t.type === 'BUY')
        .reduce((sum, t) => sum + t.totalAmount, 0),
      totalSellAmount: transactions
        .filter(t => t.type === 'SELL')
        .reduce((sum, t) => sum + t.totalAmount, 0),
      totalFeesPaid: transactions.reduce((sum, t) => sum + t.fee, 0)
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};
