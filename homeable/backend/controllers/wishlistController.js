const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { toPositiveInt } = require('../utils/sanitize');

exports.getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.getItems(req.user.id);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const productId = toPositiveInt(req.body.productId, 0);
    if (!productId) return res.status(400).json({ success: false, message: 'Valid productId is required.' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    await Wishlist.add(req.user.id, productId);
    const items = await Wishlist.getItems(req.user.id);
    res.status(201).json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    await Wishlist.remove(req.user.id, req.params.productId);
    const items = await Wishlist.getItems(req.user.id);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};
