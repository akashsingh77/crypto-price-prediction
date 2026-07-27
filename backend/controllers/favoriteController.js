const Favorite = require('../models/Favorite');
const Coin = require('../models/Coin');
const { isValidObjectId } = require('../utils/validation');

// @desc    Add coin to favorites
// @route   POST /api/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { coinId } = req.body;

    // Validation
    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    // Check if coin exists
    const coin = await Coin.findById(coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId: req.user.id,
      coinId
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Coin already in favorites' });
    }

    const favorite = await Favorite.create({
      userId: req.user.id,
      coinId,
      coinSymbol: coin.symbol,
      coinName: coin.name
    });

    res.status(201).json({
      success: true,
      message: 'Coin added to favorites',
      favorite
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coin already in favorites' });
    }
    next(error);
  }
};

// @desc    Remove coin from favorites
// @route   DELETE /api/favorites/:coinId
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const { coinId } = req.params;

    // Validation
    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    const favorite = await Favorite.findOneAndDelete({
      userId: req.user.id,
      coinId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coin removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorite coins
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Favorite.countDocuments({ userId: req.user.id });
    const favorites = await Favorite.find({ userId: req.user.id })
      .populate('coinId', 'name symbol currentPrice change24h image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    res.status(200).json({
      success: true,
      count: favorites.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      favorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if coin is favorited
// @route   GET /api/favorites/check/:coinId
// @access  Private
exports.isFavorited = async (req, res, next) => {
  try {
    const { coinId } = req.params;

    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    const favorite = await Favorite.findOne({
      userId: req.user.id,
      coinId
    });

    res.status(200).json({
      success: true,
      isFavorited: !!favorite
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get favorite count
// @route   GET /api/favorites/count
// @access  Private
exports.getFavoriteCount = async (req, res, next) => {
  try {
    const count = await Favorite.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite
// @route   POST /api/favorites/toggle/:coinId
// @access  Private
exports.toggleFavorite = async (req, res, next) => {
  try {
    const { coinId } = req.params;

    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    const coin = await Coin.findById(coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    const favorite = await Favorite.findOne({
      userId: req.user.id,
      coinId
    });

    if (favorite) {
      // Remove if exists
      await Favorite.findByIdAndDelete(favorite._id);
      res.status(200).json({
        success: true,
        message: 'Coin removed from favorites',
        isFavorited: false
      });
    } else {
      // Add if doesn't exist
      const newFavorite = await Favorite.create({
        userId: req.user.id,
        coinId,
        coinSymbol: coin.symbol,
        coinName: coin.name
      });

      res.status(201).json({
        success: true,
        message: 'Coin added to favorites',
        isFavorited: true,
        favorite: newFavorite
      });
    }
  } catch (error) {
    next(error);
  }
};
