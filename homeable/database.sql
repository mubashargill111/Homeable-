-- ============================================================
-- Homeable E-Commerce Database Schema
-- MySQL 8.0+
-- ============================================================

DROP DATABASE IF EXISTS homeable_db;
CREATE DATABASE homeable_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE homeable_db;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ADDRESSES
-- ------------------------------------------------------------
CREATE TABLE addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_addresses_user (user_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- CATEGORIES
-- ------------------------------------------------------------
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categories_slug (slug)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  short_description VARCHAR(255) DEFAULT NULL,
  description TEXT,
  specifications TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2) DEFAULT NULL,
  sku VARCHAR(60) NOT NULL UNIQUE,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  gallery TEXT COMMENT 'JSON array of image paths',
  is_featured TINYINT(1) DEFAULT 0,
  is_new TINYINT(1) DEFAULT 0,
  is_bestseller TINYINT(1) DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INT DEFAULT 0,
  status ENUM('active','draft','archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  INDEX idx_products_slug (slug),
  INDEX idx_products_category (category_id),
  INDEX idx_products_status (status),
  FULLTEXT INDEX ftx_products_search (name, short_description, description)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- WISHLIST
-- ------------------------------------------------------------
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_wishlist (user_id, product_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- CART (persisted per user)
-- ------------------------------------------------------------
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_cart_item (user_id, product_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  billing_name VARCHAR(150) NOT NULL,
  billing_phone VARCHAR(30) NOT NULL,
  billing_address TEXT NOT NULL,
  shipping_name VARCHAR(150) NOT NULL,
  shipping_phone VARCHAR(30) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method ENUM('cod','credit_card') NOT NULL DEFAULT 'cod',
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  coupon_code VARCHAR(50) DEFAULT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_orders_user (user_id),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image VARCHAR(255) DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- REVIEWS
-- ------------------------------------------------------------
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(150) DEFAULT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_review (product_id, user_id),
  INDEX idx_reviews_product (product_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- CONTACTS (contact form submissions)
-- ------------------------------------------------------------
CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(200) DEFAULT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- NEWSLETTER
-- ------------------------------------------------------------
CREATE TABLE newsletter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Users: password for all sample users is "Password123!" (bcrypt hashed, verified working hash)
INSERT INTO users (full_name, email, password, phone, role) VALUES
('Admin User', 'admin@homeable.com', '$2b$12$JqEMiB/8eXW/DbCBjvLIhOGPpPpH/2Pc49HV1HGobmk08H0eJsEUa', '+92 300 1234567', 'admin'),
('Ayesha Khan', 'ayesha.khan@example.com', '$2b$12$JqEMiB/8eXW/DbCBjvLIhOGPpPpH/2Pc49HV1HGobmk08H0eJsEUa', '+92 301 2345678', 'customer'),
('Bilal Ahmed', 'bilal.ahmed@example.com', '$2b$12$JqEMiB/8eXW/DbCBjvLIhOGPpPpH/2Pc49HV1HGobmk08H0eJsEUa', '+92 302 3456789', 'customer'),
('Sara Malik', 'sara.malik@example.com', '$2b$12$JqEMiB/8eXW/DbCBjvLIhOGPpPpH/2Pc49HV1HGobmk08H0eJsEUa', '+92 303 4567890', 'customer');

INSERT INTO categories (name, slug, description, image) VALUES
('Wall Art', 'wall-art', 'Curated prints and framed pieces for every room', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'),
('Lighting', 'lighting', 'Warm, sculptural lighting for a calmer home', 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?q=80&w=800&auto=format&fit=crop'),
('Vases & Decor', 'vases-decor', 'Ceramic and glass accents with organic shapes', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800&auto=format&fit=crop'),
('Furniture', 'furniture', 'Minimal, Scandinavian-inspired furniture pieces', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop'),
('Textiles', 'textiles', 'Linen, wool, and cotton textiles for a cozy home', 'https://images.unsplash.com/photo-1615529162924-f8605388461d?q=80&w=800&auto=format&fit=crop'),
('Tableware', 'tableware', 'Handmade ceramics and everyday tableware', 'https://images.unsplash.com/photo-1587080266227-677cc2a4e76e?q=80&w=800&auto=format&fit=crop');

INSERT INTO products
(category_id, name, slug, short_description, description, specifications, price, compare_price, sku, stock, image, gallery, is_featured, is_new, is_bestseller, rating, review_count) VALUES
(1, 'Linework Portrait Print', 'linework-portrait-print', 'Minimal single-line face illustration, museum-quality print', 'A single continuous line captures a quiet portrait. Printed on 250gsm archival matte paper with pigment inks that resist fading for decades. Frame not included.', 'Size: 30x40cm\nPaper: 250gsm archival matte\nPrinting: Giclée pigment ink\nFrame: Not included', 32.00, 42.00, 'HB-WA-001', 48, 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop","https://images.unsplash.com/photo-1582201957400-244c02b81a5b?q=80&w=800&auto=format&fit=crop"]', 1, 0, 1, 4.8, 26),
(1, 'Abstract Terracotta Study', 'abstract-terracotta-study', 'Warm abstract shapes in clay and cream tones', 'An abstract composition of soft terracotta forms, designed to bring warmth into minimal interiors. Printed on textured cotton-rag paper.', 'Size: 40x50cm\nPaper: Cotton rag 300gsm\nPrinting: Giclée pigment ink', 38.00, NULL, 'HB-WA-002', 35, 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800&auto=format&fit=crop"]', 1, 1, 0, 4.6, 14),
(1, 'Botanical Study No.3', 'botanical-study-no-3', 'Sketched botanical study in muted sepia', 'A delicate botanical illustration inspired by pressed herbarium plates. A quiet, grounding addition to any wall.', 'Size: 30x40cm\nPaper: 250gsm archival matte', 29.00, NULL, 'HB-WA-003', 52, 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=800&auto=format&fit=crop"]', 0, 0, 1, 4.7, 19),
(2, 'Bergen Ceramic Table Lamp', 'bergen-ceramic-table-lamp', 'Hand-glazed ceramic base with linen shade', 'The Bergen lamp pairs a hand-glazed ceramic base with a natural linen shade, casting a soft, warm glow. A sculptural centerpiece for any side table.', 'Height: 45cm\nBase: Ceramic\nShade: Natural linen\nBulb: E27 (not included)', 89.00, 110.00, 'HB-LT-001', 22, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop"]', 1, 0, 1, 4.9, 41),
(2, 'Oslo Pendant Light', 'oslo-pendant-light', 'Rattan-woven pendant with warm ambient glow', 'Hand-woven rattan diffuses light into a warm, dappled glow, evoking Scandinavian evenings. Suspend over a dining table or reading nook.', 'Diameter: 35cm\nMaterial: Natural rattan\nCord length: 150cm adjustable', 76.00, NULL, 'HB-LT-002', 18, 'https://images.unsplash.com/photo-1543198126-c0b6a0a4a1e0?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1543198126-c0b6a0a4a1e0?q=80&w=800&auto=format&fit=crop"]', 0, 1, 0, 4.5, 9),
(3, 'Sculptural Stoneware Vase', 'sculptural-stoneware-vase', 'Organic curved form in matte stoneware', 'Each vase is hand-thrown and finished with a matte glaze, so no two pieces are identical. A quiet sculptural statement for a shelf or console.', 'Height: 28cm\nMaterial: Stoneware\nCare: Wipe clean, not dishwasher safe', 54.00, 64.00, 'HB-VD-001', 30, 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800&auto=format&fit=crop"]', 1, 0, 0, 4.7, 22),
(3, 'Amber Glass Bud Vase Set', 'amber-glass-bud-vase-set', 'Set of 3 hand-blown amber glass vases', 'Three hand-blown vases in varying heights, perfect for single stems or dried grasses. Sold as a set.', 'Set of: 3\nMaterial: Hand-blown glass\nHeights: 12cm, 18cm, 24cm', 46.00, NULL, 'HB-VD-002', 27, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop"]', 0, 1, 1, 4.6, 17),
(4, 'Nora Oak Side Table', 'nora-oak-side-table', 'Solid oak side table with tapered legs', 'Crafted from solid European oak with gently tapered legs, the Nora table brings warmth and quiet craftsmanship to any seating area.', 'Dimensions: 45x45x50cm\nMaterial: Solid oak\nAssembly: Minimal, tools included', 210.00, 260.00, 'HB-FN-001', 12, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop"]', 1, 0, 1, 4.8, 31),
(4, 'Linen Lounge Armchair', 'linen-lounge-armchair', 'Boucle-textured armchair with oak legs', 'A relaxed, low-profile armchair upholstered in natural boucle fabric with solid oak legs. Designed for long, unhurried afternoons.', 'Dimensions: 78x82x76cm\nUpholstery: Boucle\nFrame: Solid oak', 480.00, NULL, 'HB-FN-002', 8, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop"]', 1, 1, 0, 4.9, 15),
(5, 'Stonewashed Linen Throw', 'stonewashed-linen-throw', 'Pre-washed 100% linen throw blanket', 'Softened through a natural stonewashing process, this linen throw drapes beautifully over a sofa or bed and only gets softer with age.', 'Size: 130x180cm\nMaterial: 100% linen\nCare: Machine washable cold', 58.00, 68.00, 'HB-TX-001', 40, 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1600369672770-985fd30004eb?q=80&w=800&auto=format&fit=crop"]', 0, 0, 1, 4.7, 28),
(5, 'Wool Floor Cushion', 'wool-floor-cushion', 'Chunky knit wool floor cushion', 'A generously sized floor cushion in a chunky wool knit, ideal for casual seating or lounging by the fire.', 'Diameter: 60cm\nMaterial: 100% wool\nFilling: Recycled polyester fibre', 64.00, NULL, 'HB-TX-002', 20, 'https://images.unsplash.com/photo-1616627561950-9f746e330187?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1616627561950-9f746e330187?q=80&w=800&auto=format&fit=crop"]', 0, 1, 0, 4.4, 6),
(6, 'Hand-Thrown Dinner Set', 'hand-thrown-dinner-set', 'Speckled stoneware dinner set for four', 'A four-piece dinnerware set thrown by hand in speckled stoneware, with a soft matte glaze that feels grounded and warm at the table.', 'Set includes: 4 dinner plates, 4 side plates, 4 bowls\nMaterial: Stoneware\nDishwasher safe: Yes', 96.00, 120.00, 'HB-TW-001', 16, 'https://images.unsplash.com/photo-1587080266227-677cc2a4e76e?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1587080266227-677cc2a4e76e?q=80&w=800&auto=format&fit=crop"]', 1, 0, 1, 4.8, 24),
(6, 'Organic Shape Serving Bowl', 'organic-shape-serving-bowl', 'Large freeform ceramic serving bowl', 'A generously sized serving bowl with a soft freeform edge, equally at home holding fruit or serving guests at dinner.', 'Diameter: 32cm\nMaterial: Ceramic\nDishwasher safe: Yes', 42.00, NULL, 'HB-TW-002', 24, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop', '["https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop"]', 0, 0, 0, 4.5, 11);

INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES
(1, 2, 5, 'Beautiful print', 'The quality is stunning and the print arrived perfectly packaged.'),
(1, 3, 5, 'Exactly as pictured', 'Colors are accurate and the paper feels premium.'),
(4, 2, 5, 'Gorgeous light', 'This lamp completely changed the feel of my living room.'),
(9, 4, 5, 'Sturdy and beautiful', 'Great craftsmanship, very happy with this table.');

INSERT INTO orders (order_number, user_id, billing_name, billing_phone, billing_address, shipping_name, shipping_phone, shipping_address, payment_method, payment_status, subtotal, shipping_fee, tax, discount, total, status) VALUES
('HB-100001', 2, 'Ayesha Khan', '+92 301 2345678', '12 Garden Town, Lahore, Punjab, Pakistan', 'Ayesha Khan', '+92 301 2345678', '12 Garden Town, Lahore, Punjab, Pakistan', 'cod', 'pending', 121.00, 10.00, 6.05, 0.00, 137.05, 'processing'),
('HB-100002', 3, 'Bilal Ahmed', '+92 302 3456789', '45 F-10 Markaz, Islamabad, Pakistan', 'Bilal Ahmed', '+92 302 3456789', '45 F-10 Markaz, Islamabad, Pakistan', 'credit_card', 'paid', 210.00, 0.00, 10.50, 20.00, 200.50, 'delivered');

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, line_total) VALUES
(1, 1, 'Linework Portrait Print', 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop', 32.00, 1, 32.00),
(1, 4, 'Bergen Ceramic Table Lamp', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop', 89.00, 1, 89.00),
(2, 9, 'Nora Oak Side Table', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop', 210.00, 1, 210.00);

INSERT INTO wishlist (user_id, product_id) VALUES (2, 6), (2, 9), (3, 4);
