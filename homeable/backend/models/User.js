const { pool } = require('../config/db');

const User = {
  async create({ full_name, email, password, phone }) {
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)',
      [full_name, email, password, phone || null]
    );
    return result.insertId;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async updateProfile(id, { full_name, phone }) {
    await pool.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone, id]);
  },

  async updatePassword(id, hashedPassword) {
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  },

  async setResetToken(id, token, expires) {
    await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, id]);
  },

  async findByResetToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    return rows[0];
  },

  async clearResetToken(id) {
    await pool.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [id]);
  },

  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [Number(limit), Number(offset)]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    return { rows, total };
  },

  async updateRole(id, role) {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  },

  async remove(id) {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
  },

  // Addresses
  async listAddresses(userId) {
    const [rows] = await pool.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);
    return rows;
  },

  async addAddress(userId, data) {
    const { label, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default } = data;
    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    const [result] = await pool.query(
      `INSERT INTO addresses (user_id, label, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, label || 'Home', full_name, phone, address_line1, address_line2 || null, city, state, postal_code, country || 'Pakistan', is_default ? 1 : 0]
    );
    return result.insertId;
  },

  async removeAddress(userId, addressId) {
    await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
  }
};

module.exports = User;
