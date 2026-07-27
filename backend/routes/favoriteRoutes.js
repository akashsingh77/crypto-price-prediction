const express = require('express');
const {
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorited,
  getFavoriteCount,
  toggleFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// Favorite routes
router.post('/', addFavorite);
router.get('/', getFavorites);
router.get('/count', getFavoriteCount);
router.get('/check/:coinId', isFavorited);
router.post('/toggle/:coinId', toggleFavorite);
router.delete('/:coinId', removeFavorite);

module.exports = router;
