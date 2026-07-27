const express = require('express');
const {
  createPrediction,
  getPredictionHistory,
  getPrediction,
  updatePrediction,
  deletePrediction
} = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Main prediction routes
router.post('/', createPrediction);
router.get('/history', getPredictionHistory);
router.get('/:id', getPrediction);
router.put('/:id', updatePrediction);
router.delete('/:id', deletePrediction);

module.exports = router;
