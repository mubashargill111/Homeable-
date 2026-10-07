const { pool } = require('../config/db');
const { slugify } = require('./Product');

const Category = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.status = 'active'
       GROUP BY c.id ORDER BY c.name ASC`
    );
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ?', [slug]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, description, image }) {
    const slug = slugify(name);
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, image) VALUES (?, ?, ?, ?)',
      [name, slug, description || null, image || null]
    );
    return result.insertId;
  },

  async update(id, { name, description, image }) {
    const fields = [];
    const params = [];
    if (name) { fields.push('name = ?', 'slug = ?'); params.push(name, slugify(name)); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (image !== undefined) { fields.push('image = ?'); params.push(image); }
    if (!fields.length) return;
    params.push(id);
    await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async remove(id) {
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  }
};

module.exports = Category;
