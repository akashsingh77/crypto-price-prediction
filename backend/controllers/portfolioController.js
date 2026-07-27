const Portfolio = require('../models/Portfolio');
const Coin = require('../models/Coin');
const Transaction = require('../models/Transaction');
const { isValidObjectId } = require('../utils/validation');

// @desc    Get user's portfolio
// @route   GET /api/portfolio
// @access  Private
exports.getPortfolio = async (req, res, next) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id }).populate('coins.coinId', 'name symbol currentPrice');

    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: req.user.id,
        coins: [],
        totalInvestment: 0,
        currentPortfolioValue: 0,
        totalProfitLoss: 0,
        cash: 100000
      });
    }

    res.status(200).json({
      success: true,
      portfolio
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add coin to portfolio
// @route   POST /api/portfolio/add-coin
// @access  Private
exports.addCoin = async (req, res, next) => {
  try {
    const { coinId, quantity, averageBuyPrice } = req.body;

    // Validation
    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    if (!averageBuyPrice || averageBuyPrice <= 0) {
      return res.status(400).json({ message: 'Average buy price must be a positive number' });
    }

    // Get coin details
    const coin = await Coin.findById(coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId: req.user.id
      });
    }

    // Check if coin already in portfolio
    const existingCoin = portfolio.coins.find(c => c.coinId.toString() === coinId);
    
    if (existingCoin) {
      return res.status(400).json({ message: 'Coin already in portfolio. Use buy coin endpoint to add more.' });
    }

    // Calculate values
    const totalCost = quantity * averageBuyPrice;
    const currentValue = quantity * coin.currentPrice;
    const profitLoss = currentValue - totalCost;
    const profitLossPercentage = (profitLoss / totalCost) * 100;

    portfolio.coins.push({
      coinId,
      coinSymbol: coin.symbol,
      coinName: coin.name,
      quantity,
      averageBuyPrice,
      currentValue,
      profitLoss,
      profitLossPercentage
    });

    portfolio.totalInvestment += totalCost;
    portfolio.cash -= totalCost;
    portfolio.currentPortfolioValue = portfolio.coins.reduce((sum, c) => sum + c.currentValue, 0);
    portfolio.totalProfitLoss = portfolio.coins.reduce((sum, c) => sum + c.profitLoss, 0);
    portfolio.totalProfitLossPercentage = (portfolio.totalProfitLoss / portfolio.totalInvestment) * 100 || 0;

    await portfolio.save();

    res.status(201).json({
      success: true,
      message: 'Coin added to portfolio successfully',
      portfolio
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buy coin
// @route   POST /api/portfolio/buy
// @access  Private
exports.buyCoin = async (req, res, next) => {
  try {
    const { coinId, quantity, price } = req.body;

    // Validation
    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const coin = await Coin.findById(coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    let portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user.id });
    }

    const totalCost = quantity * price;
    if (portfolio.cash < totalCost) {
      return res.status(400).json({ message: `Insufficient funds. Required: $${totalCost}, Available: $${portfolio.cash}` });
    }

    const existingCoin = portfolio.coins.find(c => c.coinId.toString() === coinId);

    if (existingCoin) {
      // Update existing coin
      const newTotalCost = (existingCoin.quantity * existingCoin.averageBuyPrice) + totalCost;
      const newQuantity = existingCoin.quantity + quantity;
      const newAverageBuyPrice = newTotalCost / newQuantity;

      existingCoin.quantity = newQuantity;
      existingCoin.averageBuyPrice = newAverageBuyPrice;
    } else {
      // Add new coin
      portfolio.coins.push({
        coinId,
        coinSymbol: coin.symbol,
        coinName: coin.name,
        quantity,
        averageBuyPrice: price
      });
    }

    // Update portfolio values
    portfolio.cash -= totalCost;
    portfolio.coins.forEach(c => {
      if (c.coinId.toString() === coinId) {
        c.currentValue = c.quantity * coin.currentPrice;
        c.profitLoss = c.currentValue - (c.quantity * c.averageBuyPrice);
        c.profitLossPercentage = (c.profitLoss / (c.quantity * c.averageBuyPrice)) * 100;
      }
    });

    portfolio.totalInvestment += totalCost;
    portfolio.currentPortfolioValue = portfolio.coins.reduce((sum, c) => sum + c.currentValue, 0);
    portfolio.totalProfitLoss = portfolio.coins.reduce((sum, c) => sum + c.profitLoss, 0);

    await portfolio.save();

    // Create transaction record
    await Transaction.create({
      userId: req.user.id,
      coinId,
      coinSymbol: coin.symbol,
      coinName: coin.name,
      type: 'BUY',
      quantity,
      price,
      totalAmount: totalCost,
      fee: 0,
      netAmount: totalCost,
      transactionDate: new Date(),
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      message: 'Coin purchased successfully',
      portfolio
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sell coin
// @route   POST /api/portfolio/sell
// @access  Private
exports.sellCoin = async (req, res, next) => {
  try {
    const { coinId, quantity, price } = req.body;

    // Validation
    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const coin = await Coin.findById(coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    const portfolio = await Portfolio.findOne({ userId: req.user.id });
    if (!portfolio) {
      return res.status(400).json({ message: 'Portfolio not found' });
    }

    const coinIndex = portfolio.coins.findIndex(c => c.coinId.toString() === coinId);
    if (coinIndex === -1) {
      return res.status(400).json({ message: 'Coin not in portfolio' });
    }

    const portfolioCoin = portfolio.coins[coinIndex];
    if (portfolioCoin.quantity < quantity) {
      return res.status(400).json({ message: `Insufficient quantity. Have: ${portfolioCoin.quantity}, Trying to sell: ${quantity}` });
    }

    const saleAmount = quantity * price;
    portfolioCoin.quantity -= quantity;

    if (portfolioCoin.quantity === 0) {
      portfolio.coins.splice(coinIndex, 1);
    } else {
      portfolioCoin.currentValue = portfolioCoin.quantity * coin.currentPrice;
      portfolioCoin.profitLoss = portfolioCoin.currentValue - (portfolioCoin.quantity * portfolioCoin.averageBuyPrice);
      portfolioCoin.profitLossPercentage = (portfolioCoin.profitLoss / (portfolioCoin.quantity * portfolioCoin.averageBuyPrice)) * 100;
    }

    portfolio.cash += saleAmount;
    portfolio.totalInvestment -= (quantity * portfolioCoin.averageBuyPrice);
    portfolio.currentPortfolioValue = portfolio.coins.reduce((sum, c) => sum + c.currentValue, 0);
    portfolio.totalProfitLoss = portfolio.coins.reduce((sum, c) => sum + c.profitLoss, 0);

    await portfolio.save();

    // Create transaction record
    await Transaction.create({
      userId: req.user.id,
      coinId,
      coinSymbol: coin.symbol,
      coinName: coin.name,
      type: 'SELL',
      quantity,
      price,
      totalAmount: saleAmount,
      fee: 0,
      netAmount: saleAmount,
      transactionDate: new Date(),
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      message: 'Coin sold successfully',
      saleAmount,
      portfolio
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get portfolio summary
// @route   GET /api/portfolio/summary
// @access  Private
exports.getPortfolioSummary = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id }).populate('coins.coinId', 'name symbol currentPrice');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const summary = {
      totalInvestment: portfolio.totalInvestment,
      currentPortfolioValue: portfolio.currentPortfolioValue,
      totalProfitLoss: portfolio.totalProfitLoss,
      totalProfitLossPercentage: portfolio.totalProfitLossPercentage,
      cash: portfolio.cash,
      totalAssets: portfolio.currentPortfolioValue + portfolio.cash,
      coinsCount: portfolio.coins.length
    };

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};
