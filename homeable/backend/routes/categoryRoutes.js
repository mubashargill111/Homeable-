const express = require('express');
const router = express.Router();
const categories = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', categories.getCategories);
router.get('/:slug', categories.getCategoryBySlug);
router.post('/', protect, restrictTo('admin'), categories.createCategory);
router.put('/:id', protect, restrictTo('admin'), categories.updateCategory);
router.delete('/:id', protect, restrictTo('admin'), categories.deleteCategory);

module.exports = router;
