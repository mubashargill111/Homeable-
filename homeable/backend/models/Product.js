const { pool } = require('../config/db');
const { cleanString, optionalString, toNonNegativeNumber, toPositiveInt } = require('../utils/sanitize');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const Product = {
  slugify,

  async findAll(filters = {}) {
    const {
      category, minPrice, maxPrice, search, sort, page = 1, limit = 12,
      featured, isNew, bestseller, status = 'active'
    } = filters;
    const safePage = toPositiveInt(page, 1, 10000);
    const safeLimit = toPositiveInt(limit, 12, 100);
    const allowedStatus = ['active', 'draft', 'archived'];
    const safeStatus = allowedStatus.includes(status) ? status : 'active';

    const where = [];
    const params = [];

    where.push('p.status = ?');
    params.push(safeStatus);

    if (category) {
      where.push('c.slug = ?');
      params.push(cleanString(category, 120));
    }
    if (minPrice) {
      where.push('p.price >= ?');
      params.push(toNonNegativeNumber(minPrice));
    }
    if (maxPrice) {
      where.push('p.price <= ?');
      params.push(toNonNegativeNumber(maxPrice));
    }
    if (search) {
      where.push('(p.name LIKE ? OR p.short_description LIKE ? OR p.description LIKE ?)');
      const term = `%${cleanString(search, 120)}%`;
      params.push(term, term, term);
    }
    if (featured) where.push('p.is_featured = 1');
    if (isNew) where.push('p.is_new = 1');
    if (bestseller) where.push('p.is_bestseller = 1');

    let orderBy = 'p.created_at DESC';
    if (sort === 'price-low') orderBy = 'p.price ASC';
    else if (sort === 'price-high') orderBy = 'p.price DESC';
    else if (sort === 'popular') orderBy = 'p.review_count DESC, p.rating DESC';
    else if (sort === 'newest') orderBy = 'p.created_at DESC';

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (safePage - 1) * safeLimit;

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p JOIN categories c ON p.category_id = c.id
       ${whereSql}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p JOIN categories c ON p.category_id = c.id ${whereSql}`,
      params
    );

    return { rows, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  },

  async findBySlug(slug) {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },

  async related(categoryId, excludeId, limit = 4) {
    const [rows] = await pool.query(
      `SELECT * FROM products WHERE category_id = ? AND id != ? AND status = 'active' LIMIT ?`,
      [categoryId, excludeId, Number(limit)]
    );
    return rows;
  },

  async create(data) {
    const {
      category_id, name, short_description, description, specifications,
      price, compare_price, sku, stock, image, gallery,
      is_featured, is_new, is_bestseller, status
    } = data;
    const safeName = cleanString(name, 200);
    const slug = slugify(safeName);
    const [result] = await pool.query(
      `INSERT INTO products
       (category_id, name, slug, short_description, description, specifications, price, compare_price, sku, stock, image, gallery, is_featured, is_new, is_bestseller, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [toPositiveInt(category_id, 0), safeName, slug, optionalString(short_description, 255), optionalString(description, 5000), optionalString(specifications, 3000),
        toNonNegativeNumber(price), compare_price === '' ? null : toNonNegativeNumber(compare_price, null), cleanString(sku, 60), toNonNegativeNumber(stock), optionalString(image, 255), JSON.stringify(gallery || []),
        is_featured === '1' || is_featured === 1 || is_featured === true ? 1 : 0,
        is_new === '1' || is_new === 1 || is_new === true ? 1 : 0,
        is_bestseller === '1' || is_bestseller === 1 || is_bestseller === true ? 1 : 0,
        ['active', 'draft', 'archived'].includes(status) ? status : 'active']
    );
    return result.insertId;
  },

  async update(id, data) {
    const fields = [];
    const params = [];
    const allowed = ['category_id', 'name', 'short_description', 'description', 'specifications',
      'price', 'compare_price', 'sku', 'stock', 'image', 'is_featured', 'is_new', 'is_bestseller', 'status'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        if (['category_id', 'stock'].includes(key)) params.push(toPositiveInt(data[key], key === 'stock' ? 0 : 1, 100000));
        else if (['price', 'compare_price'].includes(key)) params.push(data[key] === '' ? null : toNonNegativeNumber(data[key], null));
        else if (['is_featured', 'is_new', 'is_bestseller'].includes(key)) params.push(data[key] === '1' || data[key] === 1 || data[key] === true ? 1 : 0);
        else if (key === 'status') params.push(['active', 'draft', 'archived'].includes(data[key]) ? data[key] : 'active');
        else params.push(optionalString(data[key], key === 'description' ? 5000 : 255));
      }
    }
    if (data.name) {
      fields.push('slug = ?');
      params.push(slugify(cleanString(data.name, 200)));
    }
    if (data.gallery) {
      fields.push('gallery = ?');
      params.push(JSON.stringify(data.gallery));
    }
    if (!fields.length) return;
    params.push(id);
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
  },

  async remove(id) {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
  },

  async updateStock(id, quantityDelta) {
    await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [quantityDelta, id]);
  },

  async recalculateRating(productId) {
    const [[stats]] = await pool.query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE product_id = ?',
      [productId]
    );
    await pool.query('UPDATE products SET rating = ?, review_count = ? WHERE id = ?', [
      stats.avg_rating ? Number(stats.avg_rating).toFixed(1) : 0,
      stats.cnt,
      productId
    ]);
  }
};

module.exports = Product;
