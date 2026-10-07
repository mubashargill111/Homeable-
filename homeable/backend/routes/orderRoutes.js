const express = require('express');
const router = express.Router();
const orders = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.post('/checkout', orders.checkout);
router.get('/my-orders', orders.getMyOrders);
router.get('/all', restrictTo('admin'), orders.getAllOrders);
router.get('/:id', orders.getOrderById);
router.put('/:id/status', restrictTo('admin'), orders.updateOrderStatus);

module.exports = router;
