const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { toPositiveInt } = require('../utils/sanitize');

exports.getCart = async (req, res, next) => {
  try {
    const items = await Cart.getItems(req.user.id);
    const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    res.json({ success: true, items, subtotal });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const productId = toPositiveInt(req.body.productId, 0);
    const quantity = toPositiveInt(req.body.quantity, 1, 99);
    if (!productId) return res.status(400).json({ success: false, message: 'Valid productId is required.' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    const existingQuantity = await Cart.getQuantity(req.user.id, productId);
    if (product.stock < existingQuantity + quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available.' });
    }
    await Cart.addItem(req.user.id, productId, quantity);
    const items = await Cart.getItems(req.user.id);
    res.status(201).json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const quantity = toPositiveInt(req.body.quantity, 0, 99);
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Not enough stock available.' });
    }
    await Cart.updateQuantity(req.user.id, req.params.productId, quantity);
    const items = await Cart.getItems(req.user.id);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    await Cart.removeItem(req.user.id, req.params.productId);
    const items = await Cart.getItems(req.user.id);
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.clear(req.user.id);
    res.json({ success: true, items: [] });
  } catch (err) {
    next(err);
  }
};
