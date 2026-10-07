const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));
router.get('/dashboard', admin.getDashboardStats);
router.get('/users', admin.getUsers);
router.put('/users/:id/role', admin.updateUserRole);
router.delete('/users/:id', admin.deleteUser);

module.exports = router;
