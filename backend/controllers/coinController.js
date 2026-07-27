const Coin = require('../models/Coin');
const coinService = require('../services/coinService');
const { isValidObjectId } = require('../utils/validation');

// @desc    Get all coins with pagination and filtering
// @route   GET /api/coins
// @access  Public
exports.getCoins = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy = '-rank' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Search by name or symbol
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { symbol: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const total = await Coin.countDocuments(query);
    const coins = await Coin.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip(skip)
      .exec();

    res.status(200).json({
      success: true,
      count: coins.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      coins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single coin details
// @route   GET /api/coins/:id
// @access  Public
exports.getCoinById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid coin ID' });
    }

    const coin = await Coin.findById(id);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    res.status(200).json({
      success: true,
      coin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get coin by symbol
// @route   GET /api/coins/symbol/:symbol
// @access  Public
exports.getCoinBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    const coin = await Coin.findOne({ symbol: symbol.toUpperCase() });
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    res.status(200).json({
      success: true,
      coin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search coins
// @route   GET /api/coins/search/:query
// @access  Public
exports.searchCoins = async (req, res, next) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const coins = await Coin.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { symbol: { $regex: query, $options: 'i' } }
      ]
    }).limit(limit);

    res.status(200).json({
      success: true,
      count: coins.length,
      coins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending coins
// @route   GET /api/coins/trending
// @access  Public
exports.getTrendingCoins = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const coins = await Coin.find()
      .sort({ change24h: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: coins.length,
      coins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top gainers
// @route   GET /api/coins/gainers
// @access  Public
exports.getTopGainers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const coins = await Coin.find({ change24h: { $gt: 0 } })
      .sort({ change24h: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: coins.length,
      coins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top losers
// @route   GET /api/coins/losers
// @access  Public
exports.getTopLosers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const coins = await Coin.find({ change24h: { $lt: 0 } })
      .sort({ change24h: 1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: coins.length,
      coins
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical prices
// @route   GET /api/coins/:id/history
// @access  Public
exports.getHistoricalPrices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid coin ID' });
    }

    const coin = await Coin.findById(id);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Historical prices retrieved',
      data: {
        coinId: coin._id,
        symbol: coin.symbol,
        days: days,
        note: 'Historical data would be fetched from external API'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new coin (Admin only)
// @route   POST /api/coins
// @access  Private/Admin
exports.createCoin = async (req, res, next) => {
  try {
    const { name, symbol, currentPrice, marketCap, volume24h, change24h, image } = req.body;

    // Validation
    if (!name || !symbol || currentPrice === undefined) {
      return res.status(400).json({ message: 'Name, symbol, and current price are required' });
    }

    // Check if coin already exists
    const existingCoin = await Coin.findOne({ symbol: symbol.toUpperCase() });
    if (existingCoin) {
      return res.status(400).json({ message: 'Coin already exists' });
    }

    const coin = await Coin.create({
      name,
      symbol: symbol.toUpperCase(),
      currentPrice,
      marketCap: marketCap || 0,
      volume24h: volume24h || 0,
      change24h: change24h || 0,
      image
    });

    res.status(201).json({
      success: true,
      message: 'Coin created successfully',
      coin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coin (Admin only)
// @route   PUT /api/coins/:id
// @access  Private/Admin
exports.updateCoin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPrice, marketCap, volume24h, change24h } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid coin ID' });
    }

    let updateData = {};
    if (currentPrice !== undefined) updateData.currentPrice = currentPrice;
    if (marketCap !== undefined) updateData.marketCap = marketCap;
    if (volume24h !== undefined) updateData.volume24h = volume24h;
    if (change24h !== undefined) updateData.change24h = change24h;
    updateData.lastUpdated = new Date();

    const coin = await Coin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coin updated successfully',
      coin
    });
  } catch (error) {
    next(error);
  }
};
