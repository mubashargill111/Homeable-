const { pool } = require('../config/db');

const Review = {
  async findByProduct(productId) {
    const [rows] = await pool.query(
      `SELECT r.*, u.full_name AS user_name FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.created_at DESC`,
      [productId]
    );
    return rows;
  },

  async create({ productId, userId, rating, title, comment }) {
    const [result] = await pool.query(
      `INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), title = VALUES(title), comment = VALUES(comment)`,
      [productId, userId, rating, title || null, comment || null]
    );
    return result.insertId;
  },

  async remove(id, userId) {
    await pool.query('DELETE FROM reviews WHERE id = ? AND user_id = ?', [id, userId]);
  }
};

module.exports = Review;
