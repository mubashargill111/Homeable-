const express = require('express');
const router = express.Router();
const misc = require('../controllers/miscController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/contact', misc.submitContact);
router.get('/contact', protect, restrictTo('admin'), misc.getContacts);
router.post('/newsletter', misc.subscribeNewsletter);

module.exports = router;
