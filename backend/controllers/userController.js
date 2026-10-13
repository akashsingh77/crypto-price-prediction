const User = require('../models/User');
const Favorite = require('../models/Favorite');

exports.createTrade = async (req, res, next) => {
  try {
    const { symbol, name, quantity, price, type } = req.body;

    if (!symbol || !name || !quantity || !price || !type) {
      return res.status(400).json({ message: 'Missing trade details' });
    }

    if (type !== 'buy') {
      return res.status(400).json({ message: 'Only buy trades are supported right now' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalCost = quantity * price;
    if (user.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const existingHolding = user.portfolio.find((item) => item.symbol === symbol);
    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity;
      existingHolding.quantity = newQuantity;
      existingHolding.averagePrice = ((existingHolding.averagePrice * existingHolding.quantity) + (price * quantity)) / newQuantity;
    } else {
      user.portfolio.push({ symbol, name, quantity, averagePrice: price });
    }

    user.balance -= totalCost;
    await user.save();

    res.status(201).json({
      message: 'Trade executed successfully',
      balance: user.balance,
      portfolio: user.portfolio,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    const favorites = await Favorite.find({
      userId: req.user._id,
    });

    res.json({
      user,
      favorites,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.avatar = req.file ? `/uploads/${req.file.filename}` : user.avatar;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};

exports.addFavorite = async (req, res, next) => {
  try {
    const { coinId, name, symbol, image, currentPrice } = req.body;
    const favorite = await Favorite.create({
      userId: req.user._id,
      coinId,       // will be stored as string (coinGecko id like "bitcoin")
      coinSymbol: (symbol || '').toUpperCase(),
      coinName: name || '',
    });
    // Return enriched object with extra fields frontend expects
    res.status(201).json({
      ...favorite.toObject(),
      name: favorite.coinName,
      symbol: favorite.coinSymbol,
      image: image || null,
      currentPrice: currentPrice || 0,
    });
  } catch (error) {
    next(error);
  }
};

exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id });
    // Return enriched objects matching frontend expectations
    const enriched = favorites.map((fav) => ({
      _id: fav._id,
      coinId: fav.coinId,
      name: fav.coinName,
      symbol: fav.coinSymbol,
      currentPrice: 0,
      image: null,
    }));
    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    let favorite;

    // Try finding by MongoDB _id first, then by coinId string
    favorite = await Favorite.findById(id);
    if (!favorite) {
      favorite = await Favorite.findOne({ coinId: id, userId: req.user._id });
    }
    if (!favorite) return res.status(404).json({ message: 'Favorite not found' });
    if (!favorite.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Favorite.deleteOne({ _id: favorite._id });
    res.json({ message: 'Favorite removed' });
  } catch (error) {
    next(error);
  }
};
