const Prediction = require('../models/Prediction');

exports.getPredictionsByUser = async (userId) => {
  return Prediction.find({ user: userId });
};
