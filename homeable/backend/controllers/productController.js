const Product = require('../models/Product');
const { cleanString, toNonNegativeNumber, toPositiveInt } = require('../utils/sanitize');

exports.getProducts = async (req, res, next) => {
  try {
    const result = await Product.findAll(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    const related = await Product.related(product.category_id, product.id, 4);
    res.json({ success: true, product, related });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.image = `/uploads/products/${req.file.filename}`;
    }
    body.category_id = toPositiveInt(body.category_id, 0);
    body.name = cleanString(body.name, 200);
    body.sku = cleanString(body.sku, 60);
    body.price = toNonNegativeNumber(body.price, -1);
    body.stock = toPositiveInt(body.stock, 0, 100000);
    if (!body.category_id || !body.name || body.price < 0 || !body.sku) {
      return res.status(400).json({ success: false, message: 'category_id, name, price, and sku are required.' });
    }
    const id = await Product.create(body);
    const product = await Product.findById(id);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.image = `/uploads/products/${req.file.filename}`;
    }
    if (body.name !== undefined) body.name = cleanString(body.name, 200);
    if (body.sku !== undefined) body.sku = cleanString(body.sku, 60);
    await Product.update(req.params.id, body);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.remove(req.params.id);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};
