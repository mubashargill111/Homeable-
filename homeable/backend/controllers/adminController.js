const Order = require('../models/Order');
const User = require('../models/User');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Order.stats();
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await User.findAll({ page: Number(page), limit: Number(limit) });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    if (Number(req.params.id) === Number(req.user.id) && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin access.' });
    }
    await User.updateRole(req.params.id, role);
    res.json({ success: true, message: 'User role updated.' });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (Number(req.params.id) === Number(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }
    await User.remove(req.params.id);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
};
