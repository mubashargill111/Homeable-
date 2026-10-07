const express = require('express');
const router = express.Router();
const products = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', products.getProducts);
router.get('/:slug', products.getProductBySlug);
router.post('/', protect, restrictTo('admin'), upload.single('image'), products.createProduct);
router.put('/:id', protect, restrictTo('admin'), upload.single('image'), products.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), products.deleteProduct);

module.exports = router;
