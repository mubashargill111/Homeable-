const Review = require('../models/Review');
const Product = require('../models/Product');
const { cleanString, toPositiveInt } = require('../utils/sanitize');

exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findByProduct(req.params.productId);
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const rating = toPositiveInt(req.body.rating, 0, 5);
    const title = cleanString(req.body.title, 150);
    const comment = cleanString(req.body.comment, 2000);
    const productId = req.params.productId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    await Review.create({ productId, userId: req.user.id, rating, title, comment });
    await Product.recalculateRating(productId);

    const reviews = await Review.findByProduct(productId);
    res.status(201).json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    await Review.remove(req.params.id, req.user.id);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) {
    next(err);
  }
};
