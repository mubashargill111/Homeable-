const { Contact, Newsletter } = require('../models/Misc');
const { cleanString, normalizeEmail, isEmail } = require('../utils/sanitize');

exports.submitContact = async (req, res, next) => {
  try {
    const name = cleanString(req.body.name, 150);
    const email = normalizeEmail(req.body.email);
    const subject = cleanString(req.body.subject, 200);
    const message = cleanString(req.body.message, 5000);
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    await Contact.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: 'Thanks for reaching out — we will get back to you shortly.' });
  } catch (err) {
    next(err);
  }
};

exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.findAll();
    res.json({ success: true, contacts });
  } catch (err) {
    next(err);
  }
};

exports.subscribeNewsletter = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
    if (!isEmail(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    await Newsletter.subscribe(email);
    res.status(201).json({ success: true, message: 'Subscribed! Welcome to the Homeable list.' });
  } catch (err) {
    next(err);
  }
};
