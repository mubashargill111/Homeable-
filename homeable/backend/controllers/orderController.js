const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { cleanString } = require('../utils/sanitize');

const SHIPPING_FLAT_RATE = 10.0;
const FREE_SHIPPING_THRESHOLD = 150.0;
const TAX_RATE = 0.05;

exports.checkout = async (req, res, next) => {
  try {
    const billing = {
      name: cleanString(req.body.billing?.name, 150),
      phone: cleanString(req.body.billing?.phone, 30),
      address: cleanString(req.body.billing?.address, 1000)
    };
    const shipping = {
      name: cleanString(req.body.shipping?.name, 150),
      phone: cleanString(req.body.shipping?.phone, 30),
      address: cleanString(req.body.shipping?.address, 1000)
    };
    const paymentMethod = req.body.paymentMethod;
    const couponCode = cleanString(req.body.couponCode, 50).toUpperCase();

    if (!billing || !billing.name || !billing.phone || !billing.address) {
      return res.status(400).json({ success: false, message: 'Billing information is incomplete.' });
    }
    if (!shipping || !shipping.name || !shipping.phone || !shipping.address) {
      return res.status(400).json({ success: false, message: 'Shipping information is incomplete.' });
    }

    const cartItems = await Cart.getItems(req.user.id);
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Not enough stock for "${item.name}".` });
      }
    }

    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    let discount = 0;
    if (couponCode && couponCode.toUpperCase() === 'WELCOME10') {
      discount = Number((subtotal * 0.1).toFixed(2));
    }
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
    const tax = Number(((subtotal - discount) * TAX_RATE).toFixed(2));
    const total = Number((subtotal - discount + shippingFee + tax).toFixed(2));

    const items = cartItems.map(i => ({
      product_id: i.product_id, name: i.name, image: i.image, price: i.price, quantity: i.quantity
    }));

    const { orderId, orderNumber } = await Order.create({
      userId: req.user.id,
      billing,
      shipping,
      paymentMethod: paymentMethod === 'credit_card' ? 'credit_card' : 'cod',
      items,
      subtotal,
      shippingFee,
      tax,
      discount,
      total,
      couponCode
    });

    const order = await Order.findById(orderId);
    res.status(201).json({ success: true, message: `Order ${orderNumber} placed successfully.`, order });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findByUser(req.user.id);
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// ---------- Admin ----------
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const result = await Order.findAll({ page: Number(page), limit: Number(limit), status });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status.' });
    }
    await Order.updateStatus(req.params.id, status);
    const order = await Order.findById(req.params.id);
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
