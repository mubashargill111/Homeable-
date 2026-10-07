const { pool } = require('../config/db');

const Contact = {
  async create({ name, email, subject, message }) {
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || null, message]
    );
    return result.insertId;
  },
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    return rows;
  },
  async markRead(id) {
    await pool.query('UPDATE contacts SET is_read = 1 WHERE id = ?', [id]);
  }
};

const Newsletter = {
  async subscribe(email) {
    await pool.query('INSERT IGNORE INTO newsletter (email) VALUES (?)', [email]);
  },
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM newsletter ORDER BY subscribed_at DESC');
    return rows;
  }
};

module.exports = { Contact, Newsletter };
