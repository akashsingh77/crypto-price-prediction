const Prediction = require('../models/Prediction');
const Coin = require('../models/Coin');
const { isValidObjectId, isValidRecommendation, isValidPercentage } = require('../utils/validation');

// @desc    Create a price prediction
// @route   POST /api/predictions
// @access  Private
exports.createPrediction = async (req, res, next) => {
  try {
    const { coinId, predictedPrice, confidence, recommendation, notes } = req.body;

    // Validation
    if (!coinId || !isValidObjectId(coinId)) {
      return res.status(400).json({ message: 'Valid coin ID is required' });
    }

    if (predictedPrice === undefined || typeof predictedPrice !== 'number' || predictedPrice <= 0) {
      return res.status(400).json({ message: 'Predicted price must be a positive number' });
    }

    if (!isValidPercentage(confidence)) {
      return res.status(400).json({ message: 'Confidence must be between 0 and 100' });
    }

    if (!isValidRecommendation(recommendation)) {
      return res.status(400).json({ message: 'Recommendation must be Buy, Sell, or Hold' });
    }

    // Get coin details
    const coin = await Coin.findById(coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found' });
    }

    // Create prediction with 7 days expiry
    const predictionDate = new Date();
    const expiryDate = new Date(predictionDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const prediction = await Prediction.create({
      userId: req.user.id,
      coinId: coinId,
      coinSymbol: coin.symbol,
      currentPrice: coin.currentPrice,
      predictedPrice,
      confidence,
      recommendation,
      predictionDate,
      expiryDate,
      notes,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Prediction created successfully',
      prediction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's prediction history
// @route   GET /api/predictions/history
// @access  Private
exports.getPredictionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, coinId } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user.id };
    if (status) query.status = status;
    if (coinId && isValidObjectId(coinId)) query.coinId = coinId;

    const total = await Prediction.countDocuments(query);
    const predictions = await Prediction.find(query)
      .sort({ predictionDate: -1 })
      .limit(limit * 1)
      .skip(skip)
      .populate('coinId', 'name symbol currentPrice');

    res.status(200).json({
      success: true,
      count: predictions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      predictions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single prediction
// @route   GET /api/predictions/:id
// @access  Private
exports.getPrediction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid prediction ID' });
    }

    const prediction = await Prediction.findById(id)
      .populate('userId', 'name email')
      .populate('coinId', 'name symbol currentPrice');

    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    // Check authorization
    if (prediction.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this prediction' });
    }

    res.status(200).json({
      success: true,
      prediction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update prediction
// @route   PUT /api/predictions/:id
// @access  Private
exports.updatePrediction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { predictedPrice, confidence, recommendation, notes } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid prediction ID' });
    }

    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    // Check authorization
    if (prediction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this prediction' });
    }

    // Check if prediction is still pending
    if (prediction.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update completed or expired predictions' });
    }

    // Update fields
    if (predictedPrice !== undefined) {
      if (typeof predictedPrice !== 'number' || predictedPrice <= 0) {
        return res.status(400).json({ message: 'Predicted price must be a positive number' });
      }
      prediction.predictedPrice = predictedPrice;
    }

    if (confidence !== undefined) {
      if (!isValidPercentage(confidence)) {
        return res.status(400).json({ message: 'Confidence must be between 0 and 100' });
      }
      prediction.confidence = confidence;
    }

    if (recommendation !== undefined) {
      if (!isValidRecommendation(recommendation)) {
        return res.status(400).json({ message: 'Recommendation must be Buy, Sell, or Hold' });
      }
      prediction.recommendation = recommendation;
    }

    if (notes !== undefined) {
      prediction.notes = notes;
    }

    await prediction.save();

    res.status(200).json({
      success: true,
      message: 'Prediction updated successfully',
      prediction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete prediction
// @route   DELETE /api/predictions/:id
// @access  Private
exports.deletePrediction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid prediction ID' });
    }

    const prediction = await Prediction.findById(id);
    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    // Check authorization
    if (prediction.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this prediction' });
    }

    await Prediction.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Prediction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
