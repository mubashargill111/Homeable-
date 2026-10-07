/* ==========================================================================
   Homeable - Shared premium header/footer partials
   ========================================================================== */

function localHref(path) {
  return path.replace(/^\//, '');
}

function renderHeader() {
  const user = getStoredUser();
  const accountLink = user
    ? (user.role === 'admin' ? 'admin/dashboard.html' : 'dashboard.html')
    : 'login.html';
  const accountLabel = user ? user.full_name.split(' ')[0] : 'Login';

  return `
  <header class="site-header-premium">
    <div class="top-info-bar">
      <div class="container-xl top-info-inner">
        <div class="top-social">
          <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
          <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
          <a href="#" aria-label="Pinterest"><i class="bi bi-pinterest"></i></a>
          <span>Questions? Call +92 318 8437080</span>
        </div>
        <div class="top-links">
          <a href="#">Language</a>
          <a href="faq.html">Support</a>
          <a href="${accountLink}">${accountLabel}</a>
          ${user ? '' : '<a href="create-account.html">Register</a>'}
        </div>
      </div>
    </div>

    <nav class="navbar-custom" id="mainNavbar">
      <div class="container-xl navbar-inner">
        <a href="index.html" class="brand-logo">Home<span>able</span></a>

        <ul class="nav-links">
          <li><a href="index.html" data-nav="home">Home</a></li>
          <li class="has-mega">
            <a href="shop.html" data-nav="shop">Shop</a>
            <div class="mega-menu">
              <a href="shop.html?category=furniture">Furniture</a>
              <a href="shop.html?category=lighting">Lighting</a>
              <a href="shop.html?category=textiles">Textiles</a>
              <a href="shop.html?filter=bestseller">Best Sellers</a>
            </div>
          </li>
          <li><a href="new-arrivals.html" data-nav="new-arrivals">New Arrivals</a></li>
          <li><a href="about.html" data-nav="about">About</a></li>
          <li><a href="contact.html" data-nav="contact">Contact</a></li>
        </ul>

        <div class="nav-icons">
          <button class="nav-icon-btn" id="searchToggle" aria-label="Search"><i class="bi bi-search"></i></button>
          <a href="${accountLink}" class="nav-icon-btn" aria-label="${accountLabel}" title="${accountLabel}"><i class="bi bi-person"></i></a>
          <a href="wishlist.html" class="nav-icon-btn" aria-label="Wishlist"><i class="bi bi-heart"></i><span class="badge-count" id="wishlistCount">0</span></a>
          <a href="cart.html" class="nav-icon-btn nav-cart" aria-label="Cart"><i class="bi bi-bag"></i><span class="badge-count" id="cartCount">0</span></a>
          <button class="mobile-toggle" id="mobileNavToggle" aria-label="Menu"><i class="bi bi-list"></i></button>
        </div>
      </div>

      <div id="searchBar" class="search-bar-premium">
        <div class="container-xl">
          <form id="searchForm" class="search-form-premium">
            <input type="text" id="searchInput" class="form-control" placeholder="Search for products...">
            <button class="btn btn-primary btn-sm" type="submit">Search</button>
          </form>
        </div>
      </div>
    </nav>

    <div class="mobile-nav-overlay" id="mobileNavOverlay"></div>
    <div class="mobile-nav" id="mobileNav">
      <div class="mobile-nav-head">
        <span class="brand-logo">Home<span>able</span></span>
        <button id="mobileNavClose" class="mobile-nav-close" aria-label="Close menu"><i class="bi bi-x-lg"></i></button>
      </div>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="shop.html">Shop</a></li>
        <li><a href="new-arrivals.html">New Arrivals</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="${accountLink}">${accountLabel}</a></li>
        <li><a href="wishlist.html">Wishlist</a></li>
        <li><a href="cart.html">Cart</a></li>
      </ul>
    </div>
  </header>
  `;
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="container-xl">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="brand-logo">Home<span>able</span></a>
          <p>Premium decor and furniture for modern interiors, curated for customers who care about craft, comfort, and style.</p>
          <div class="footer-social">
            <a href="#" class="btn-icon" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
            <a href="#" class="btn-icon" aria-label="Pinterest"><i class="bi bi-pinterest"></i></a>
            <a href="#" class="btn-icon" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
          </div>
        </div>
        <div class="footer-col">
          <h5>Shop</h5>
          <ul>
            <li><a href="shop.html">All Products</a></li>
            <li><a href="new-arrivals.html">New Arrivals</a></li>
            <li><a href="shop.html?filter=bestseller">Best Sellers</a></li>
            <li><a href="shop.html?filter=featured">Featured</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Company</h5>
          <ul>
            <li><a href="about.html">About Us</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="privacy.html">Privacy Policy</a></li>
            <li><a href="terms.html">Terms &amp; Conditions</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Account</h5>
          <ul>
            <li><a href="login.html">Sign In</a></li>
            <li><a href="create-account.html">Create Account</a></li>
            <li><a href="dashboard.html">My Orders</a></li>
            <li><a href="wishlist.html">Wishlist</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${year} Homeable. All rights reserved.</span>
        <span>Designed for premium ecommerce.</span>
      </div>
    </div>
  </footer>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');
  if (headerEl) headerEl.innerHTML = renderHeader();
  if (footerEl) footerEl.innerHTML = renderFooter();

  const page = document.body.getAttribute('data-page');
  if (page) {
    document.querySelectorAll(`[data-nav="${page}"]`).forEach(el => el.classList.add('active'));
  }

  document.dispatchEvent(new Event('partialsLoaded'));
});
