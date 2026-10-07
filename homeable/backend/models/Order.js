const { pool } = require('../config/db');

function generateOrderNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `HB-${rand}`;
}

async function createUniqueOrderNumber(conn) {
  for (let i = 0; i < 8; i += 1) {
    const orderNumber = generateOrderNumber();
    const [rows] = await conn.query('SELECT id FROM orders WHERE order_number = ?', [orderNumber]);
    if (!rows.length) return orderNumber;
  }
  throw new Error('Could not generate a unique order number.');
}

const Order = {
  async create({
    userId, billing, shipping, paymentMethod, items, subtotal, shippingFee, tax, discount, total, couponCode
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const orderNumber = await createUniqueOrderNumber(conn);

      for (const item of items) {
        const [stockRows] = await conn.query(
          'SELECT stock, name FROM products WHERE id = ? AND status = ? FOR UPDATE',
          [item.product_id, 'active']
        );
        if (!stockRows.length) {
          const err = new Error(`Product "${item.name}" is no longer available.`);
          err.statusCode = 400;
          throw err;
        }
        if (Number(stockRows[0].stock) < Number(item.quantity)) {
          const err = new Error(`Not enough stock for "${stockRows[0].name}".`);
          err.statusCode = 400;
          throw err;
        }
      }

      const [orderResult] = await conn.query(
        `INSERT INTO orders
         (order_number, user_id, billing_name, billing_phone, billing_address,
          shipping_name, shipping_phone, shipping_address, payment_method, payment_status,
          subtotal, shipping_fee, tax, discount, total, coupon_code, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          orderNumber, userId,
          billing.name, billing.phone, billing.address,
          shipping.name, shipping.phone, shipping.address,
          paymentMethod, paymentMethod === 'credit_card' ? 'paid' : 'pending',
          subtotal, shippingFee, tax, discount, total, couponCode || null, 'pending'
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of items) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, line_total)
           VALUES (?,?,?,?,?,?,?)`,
          [orderId, item.product_id, item.name, item.image, item.price, item.quantity, item.price * item.quantity]
        );
        await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      await conn.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);

      await conn.commit();
      return { orderId, orderNumber };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async findByUser(userId) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
  },

  async findById(id) {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!orders.length) return null;
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    return { ...orders[0], items };
  },

  async findAll({ page = 1, limit = 20, status } = {}) {
    const offset = (page - 1) * limit;
    const where = status ? 'WHERE o.status = ?' : '';
    const params = status ? [status] : [];
    const [rows] = await pool.query(
      `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM orders o ${where}`, params);
    return { rows, total };
  },

  async updateStatus(id, status) {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  },

  async updatePaymentStatus(id, paymentStatus) {
    await pool.query('UPDATE orders SET payment_status = ? WHERE id = ?', [paymentStatus, id]);
  },

  async stats() {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total),0) AS total_revenue
       FROM orders WHERE status != 'cancelled'`
    );
    const [[users]] = await pool.query(`SELECT COUNT(*) AS total_users FROM users WHERE role = 'customer'`);
    const [[products]] = await pool.query(`SELECT COUNT(*) AS total_products FROM products`);
    const [byStatus] = await pool.query(`SELECT status, COUNT(*) AS count FROM orders GROUP BY status`);
    const [recentOrders] = await pool.query(
      `SELECT o.*, u.full_name AS customer_name FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 5`
    );
    return { ...totals, ...users, ...products, byStatus, recentOrders };
  }
};

module.exports = Order;
