const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { cleanString } = require('../utils/sanitize');

exports.updateProfile = async (req, res, next) => {
  try {
    const full_name = cleanString(req.body.full_name, 150);
    const phone = cleanString(req.body.phone, 30);
    if (!full_name) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    await User.updateProfile(req.user.id, { full_name, phone });
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required.' });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }
    const fullUser = await User.findByEmail(req.user.email);
    const match = await bcrypt.compare(currentPassword, fullUser.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.id, hashed);
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await User.listAddresses(req.user.id);
    res.json({ success: true, addresses });
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const data = {
      label: cleanString(req.body.label, 50) || 'Home',
      full_name: cleanString(req.body.full_name, 150),
      phone: cleanString(req.body.phone, 30),
      address_line1: cleanString(req.body.address_line1, 255),
      address_line2: cleanString(req.body.address_line2, 255),
      city: cleanString(req.body.city, 100),
      state: cleanString(req.body.state, 100),
      postal_code: cleanString(req.body.postal_code, 20),
      country: cleanString(req.body.country, 100) || 'Pakistan',
      is_default: !!req.body.is_default
    };
    if (!data.full_name || !data.phone || !data.address_line1 || !data.city || !data.state || !data.postal_code) {
      return res.status(400).json({ success: false, message: 'Please complete all required address fields.' });
    }
    await User.addAddress(req.user.id, data);
    const addresses = await User.listAddresses(req.user.id);
    res.status(201).json({ success: true, addresses });
  } catch (err) {
    next(err);
  }
};

exports.removeAddress = async (req, res, next) => {
  try {
    await User.removeAddress(req.user.id, req.params.id);
    const addresses = await User.listAddresses(req.user.id);
    res.json({ success: true, addresses });
  } catch (err) {
    next(err);
  }
};
