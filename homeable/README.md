# Homeable — Luxury Scandinavian Home Decor E-Commerce

A full-stack e-commerce website built with **HTML5, CSS3, JavaScript, Bootstrap 5** on the frontend and **Node.js, Express.js, MySQL** on the backend.

Design: warm beige background, white cards, soft brown accent, Playfair Display + Poppins typography — a minimal, luxury, Scandinavian-inspired aesthetic.

---

## 1. Requirements

- Node.js 18+
- MySQL 8.0+ (or MariaDB 10.5+)
- npm

---

## 2. Setup

### Step 1 — Create the database

```bash
mysql -u root -p < database.sql
```

This creates the `homeable_db` database, all tables, and sample data (6 categories, 14 products, 4 users, sample orders/reviews).

**Demo accounts** (password for all: `Password123!`):
- Admin: `admin@homeable.com`
- Customer: `ayesha.khan@example.com`

### Step 2 — Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your MySQL credentials (`DB_USER`, `DB_PASSWORD`) and a strong `JWT_SECRET`.

### Step 3 — Install dependencies and run

```bash
npm install
npm start
```

The server starts on **http://localhost:5000** and serves both the API (`/api/...`) and the frontend (static files) from the same process — no separate frontend server needed.

For development with auto-reload:
```bash
npm run dev
```

---

## 3. Project Structure

```
homeable/
├── database.sql              # MySQL schema + sample data
├── backend/
│   ├── server.js             # Express app entry point
│   ├── config/db.js          # MySQL connection pool
│   ├── controllers/          # Route handlers (business logic)
│   ├── models/                # Raw-SQL data access layer
│   ├── routes/                # Express routers
│   ├── middleware/            # auth, upload, error handling
│   ├── utils/jwt.js
│   ├── uploads/products/      # Uploaded product images land here
│   └── package.json
└── frontend/
    ├── index.html, shop.html, product-details.html, cart.html,
    │   checkout.html, order-confirmation.html, login.html, register.html,
    │   forgot-password.html, reset-password.html, dashboard.html,
    │   wishlist.html, about.html, contact.html, faq.html,
    │   privacy.html, terms.html, 404.html
    ├── admin/
    │   ├── dashboard.html, products.html, categories.html,
    │   └── orders.html, users.html
    ├── css/style.css          # Design system (colors, type, components)
    └── js/                    # Vanilla JS modules (api client, auth, cart, etc.)
```

---

## 4. Features Implemented

**Storefront:** hero banner, featured categories, new arrivals, best sellers,
featured products, special offer banner, testimonials, newsletter signup,
Instagram gallery, sticky responsive navbar with mobile off-canvas menu.

**Shop & product pages:** category/price filters, search, sort (newest,
popular, price), pagination, product detail page with gallery + hover zoom,
quantity selector, related products, customer reviews & ratings.

**Cart & checkout:** persistent server-side cart, coupon code (`WELCOME10`
for 10% off), free shipping over $150, 5% tax calculation, billing/shipping
address forms, Cash on Delivery or simulated credit card payment, order
confirmation page.

**Accounts:** JWT authentication with bcrypt-hashed passwords, register/
login/logout, forgot/reset password flow, protected routes, customer
dashboard (profile, order history, saved addresses, change password),
wishlist.

**Admin panel:** dashboard analytics (revenue, orders, customers, order
status breakdown), full product CRUD with image upload, category CRUD,
order status management, user role management.

**Security:** bcrypt password hashing, JWT auth, helmet security headers,
XSS sanitization, rate limiting on auth endpoints, parameterized SQL
queries (no injection risk), role-based access control.

---

## 5. Notes on Scope

This is a complete, runnable full-stack application covering the core
e-commerce flow end-to-end. A few things to be aware of before treating it
as production-ready:

- **Payments**: the "Credit Card" option is a simulated UI — no real
  payment gateway (Stripe/PayPal/etc.) is integrated. Wire one in before
  accepting real payments.
- **Email**: password reset returns a token directly in the API response
  (shown on-screen) rather than sending an email, since no email service is
  configured. Swap in a provider like SendGrid/Nodemailer for production.
- **Product images** in the sample data are hotlinked from Unsplash for a
  working out-of-the-box demo. Uploaded images via the admin panel are
  saved to `backend/uploads/products/`.
- **CSRF**: the API is stateless (Bearer/JWT-based) rather than
  cookie-session based, which sidesteps most CSRF concerns, but if you
  switch to cookie-only auth, add a CSRF token layer.

---

## 6. API Overview

All endpoints are prefixed with `/api`.

| Resource | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET /auth/me`, `POST /auth/forgot-password`, `/auth/reset-password` |
| Products | `GET /products`, `GET /products/:slug`, `POST/PUT/DELETE /products/:id` (admin) |
| Categories | `GET /categories`, `GET /categories/:slug`, `POST/PUT/DELETE /categories/:id` (admin) |
| Cart | `GET/POST/PUT/DELETE /cart` |
| Wishlist | `GET/POST/DELETE /wishlist` |
| Orders | `POST /orders/checkout`, `GET /orders/my-orders`, `GET /orders/:id`, `GET /orders/all` (admin), `PUT /orders/:id/status` (admin) |
| Reviews | `GET/POST /reviews/:productId`, `DELETE /reviews/:id` |
| Users | `PUT /users/profile`, `PUT /users/change-password`, `GET/POST/DELETE /users/addresses` |
| Admin | `GET /admin/dashboard`, `GET /admin/users`, `PUT /admin/users/:id/role`, `DELETE /admin/users/:id` |
| Misc | `POST /contact`, `POST /newsletter` |

---

Built as a demonstration full-stack project — Homeable, 2026.
