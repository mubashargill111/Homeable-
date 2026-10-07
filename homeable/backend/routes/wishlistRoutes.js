const express = require('express');
const router = express.Router();
const wishlist = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', wishlist.getWishlist);
router.post('/', wishlist.addToWishlist);
router.delete('/:productId', wishlist.removeFromWishlist);

module.exports = router;
