const Category = require('../models/Category');
const { cleanString } = require('../utils/sanitize');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findBySlug(req.params.slug);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const name = cleanString(req.body.name, 100);
    const description = cleanString(req.body.description, 255);
    const image = cleanString(req.body.image, 255);
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });
    const id = await Category.create({ name, description, image });
    const category = await Category.findById(id);
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const data = {
      name: cleanString(req.body.name, 100),
      description: req.body.description === undefined ? undefined : cleanString(req.body.description, 255),
      image: req.body.image === undefined ? undefined : cleanString(req.body.image, 255)
    };
    await Category.update(req.params.id, data);
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.remove(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    next(err);
  }
};
