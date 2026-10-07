/* ==========================================================================
   Homeable — Shared utilities
   ========================================================================== */

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/`/g, '&#96;');
}

function renderStars(rating) {
  const rounded = Math.round(Number(rating) * 2) / 2;
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (rounded >= i) stars += '★';
    else if (rounded >= i - 0.5) stars += '⯨';
    else stars += '☆';
  }
  return stars;
}

function productCardHTML(p) {
  const onSale = p.compare_price && Number(p.compare_price) > Number(p.price);
  const tag = onSale ? `<span class="product-tag sale">Sale</span>` : (p.is_new ? `<span class="product-tag">New</span>` : (p.is_bestseller ? `<span class="product-tag">Bestseller</span>` : ''));
  const slug = encodeURIComponent(p.slug || '');
  const name = escapeHTML(p.name);
  const categoryName = escapeHTML(p.category_name || '');
  const image = escapeAttr(p.image || 'images/placeholder.jpg');
  return `
  <div class="product-card reveal">
    <div class="product-media">
      <a href="product-details.html?slug=${slug}">
        <img src="${image}" alt="${escapeAttr(p.name)}" loading="lazy">
      </a>
      ${tag}
      <div class="product-quick-actions">
        <button type="button" title="Quick view" class="quick-view-btn" data-slug="${escapeAttr(p.slug || '')}"><i class="bi bi-eye"></i></button>
        <button type="button" title="Add to wishlist" class="wishlist-btn" data-product-id="${p.id}"><i class="bi bi-heart"></i></button>
      </div>
      <div class="product-add-cart">
        <button type="button" class="add-cart-btn" data-product-id="${p.id}">Add to Cart</button>
      </div>
    </div>
    <div class="product-info">
      <span class="product-cat">${categoryName}</span>
      <h3 class="product-name"><a href="product-details.html?slug=${slug}">${name}</a></h3>
      <div class="product-rating"><span class="stars">${renderStars(p.rating)}</span> (${p.review_count || 0})</div>
      <div class="product-price">
        <span class="now">${formatPrice(p.price)}</span>
        ${onSale ? `<span class="was">${formatPrice(p.compare_price)}</span>` : ''}
      </div>
    </div>
  </div>`;
}

async function handleAddToCart(productId, quantity = 1) {
  if (!getStoredUser()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  try {
    await api.post('/cart', { productId, quantity });
    showToast('Added to cart.', 'success');
    if (typeof refreshBadgeCounts === 'function') refreshBadgeCounts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleToggleWishlist(productId, btnEl) {
  if (!getStoredUser()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  try {
    const isActive = btnEl.classList.contains('active');
    if (isActive) {
      await api.delete(`/wishlist/${productId}`);
      btnEl.classList.remove('active');
      showToast('Removed from wishlist.');
    } else {
      await api.post('/wishlist', { productId });
      btnEl.classList.add('active');
      showToast('Added to wishlist.', 'success');
    }
    if (typeof refreshBadgeCounts === 'function') refreshBadgeCounts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Event delegation for dynamically-rendered product cards
document.addEventListener('click', (e) => {
  const cartBtn = e.target.closest('.add-cart-btn');
  if (cartBtn) {
    e.preventDefault();
    handleAddToCart(Number(cartBtn.dataset.productId));
  }
  const quickViewBtn = e.target.closest('.quick-view-btn');
  if (quickViewBtn) {
    e.preventDefault();
    window.location.href = `product-details.html?slug=${encodeURIComponent(quickViewBtn.dataset.slug || '')}`;
  }
  const wishBtn = e.target.closest('.wishlist-btn');
  if (wishBtn) {
    e.preventDefault();
    handleToggleWishlist(Number(wishBtn.dataset.productId), wishBtn);
  }
});
