const { pool } = require('../config/db');

const Cart = {
  async getItems(userId) {
    const [rows] = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.slug, p.price, p.image, p.stock
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? ORDER BY ci.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async addItem(userId, productId, quantity = 1) {
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [userId, productId, quantity]
    );
  },

  async getQuantity(userId, productId) {
    const [rows] = await pool.query(
      'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows[0]?.quantity || 0;
  },

  async updateQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
    } else {
      await pool.query('UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?', [quantity, userId, productId]);
    }
  },

  async removeItem(userId, productId) {
    await pool.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
  },

  async clear(userId) {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
  }
};

module.exports = Cart;
