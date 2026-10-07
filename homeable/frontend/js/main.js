/* ==========================================================================
   Homeable — Global site behavior
   ========================================================================== */

async function refreshBadgeCounts() {
  const cartBadge = document.getElementById('cartCount');
  const wishlistBadge = document.getElementById('wishlistCount');
  const user = getStoredUser();

  if (!user) {
    if (cartBadge) cartBadge.style.display = 'none';
    if (wishlistBadge) wishlistBadge.style.display = 'none';
    return;
  }

  try {
    const cartData = await api.get('/cart');
    const count = cartData.items.reduce((sum, i) => sum + i.quantity, 0);
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  } catch { /* not logged in or error — ignore */ }

  try {
    const wishData = await api.get('/wishlist');
    if (wishlistBadge) {
      wishlistBadge.textContent = wishData.items.length;
      wishlistBadge.style.display = wishData.items.length > 0 ? 'flex' : 'none';
    }
  } catch { /* ignore */ }
}

function initStickyNav() {
  const nav = document.getElementById('mainNavbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });
}

function initMobileNav() {
  const toggle = document.getElementById('mobileNavToggle');
  const close = document.getElementById('mobileNavClose');
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileNavOverlay');
  if (!toggle || !nav) return;

  const open = () => { nav.classList.add('open'); overlay.classList.add('open'); };
  const shut = () => { nav.classList.remove('open'); overlay.classList.remove('open'); };

  toggle.addEventListener('click', open);
  close.addEventListener('click', shut);
  overlay.addEventListener('click', shut);
}

function initSearchToggle() {
  const btn = document.getElementById('searchToggle');
  const bar = document.getElementById('searchBar');
  const form = document.getElementById('searchForm');
  if (!btn || !bar) return;

  btn.addEventListener('click', () => {
    const isHidden = getComputedStyle(bar).display === 'none';
    bar.style.display = isHidden ? 'block' : 'none';
    if (bar.style.display === 'block') document.getElementById('searchInput').focus();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('searchInput').value.trim();
      if (q) window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
    });
  }
}

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => observer.observe(el));
}

function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input.value.trim();
      if (!email) return;
      try {
        const res = await api.post('/newsletter', { email });
        showToast(res.message, 'success');
        input.value = '';
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

function initLogoutButtons() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try { await api.post('/auth/logout'); } catch { /* ignore */ }
      clearToken();
      window.location.href = 'login.html';
    });
  });
}

document.addEventListener('partialsLoaded', () => {
  initStickyNav();
  initMobileNav();
  initSearchToggle();
  refreshBadgeCounts();
});

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNewsletterForms();
  initLogoutButtons();
});
