const express = require('express');
const {
  getProfile,
  updateProfile,
  addFavorite,
  getFavorites,
  removeFavorite,
  createTrade,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.use(protect);

router.route('/profile').get(getProfile).put(upload.single('avatar'), updateProfile);
router.route('/favorites').get(getFavorites).post(addFavorite);
router.route('/favorites/:id').delete(removeFavorite);
router.route('/trade').post(createTrade);

module.exports = router;
