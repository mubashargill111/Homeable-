const express = require('express');
const router = express.Router();
const users = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.put('/profile', users.updateProfile);
router.put('/change-password', users.changePassword);
router.get('/addresses', users.getAddresses);
router.post('/addresses', users.addAddress);
router.delete('/addresses/:id', users.removeAddress);

module.exports = router;
