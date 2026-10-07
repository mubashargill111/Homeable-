const express = require('express');
const router = express.Router();
const cart = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', cart.getCart);
router.post('/', cart.addToCart);
router.put('/:productId', cart.updateCartItem);
router.delete('/:productId', cart.removeCartItem);
router.delete('/', cart.clearCart);

module.exports = router;
