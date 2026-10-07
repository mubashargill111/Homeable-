const express = require('express');
const router = express.Router();
const reviews = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:productId', reviews.getReviews);
router.post('/:productId', protect, reviews.createReview);
router.delete('/:id', protect, reviews.deleteReview);

module.exports = router;
