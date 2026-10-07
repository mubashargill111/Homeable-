/* ==========================================================================
   Homeable — Product Details page
   ========================================================================== */

let currentProduct = null;
let currentQty = 1;

function renderGallery(product) {
  let gallery = [];
  try { gallery = JSON.parse(product.gallery || '[]'); } catch { gallery = []; }
  if (!gallery.length) gallery = [product.image];

  const main = document.getElementById('pdMainImage');
  const thumbs = document.getElementById('pdThumbs');
  main.src = gallery[0];
  main.alt = product.name;

  thumbs.innerHTML = gallery.map((src, i) => `
    <img src="${escapeAttr(src)}" class="${i === 0 ? 'active' : ''}" data-src="${escapeAttr(src)}" alt="${escapeAttr(product.name)} thumbnail ${i + 1}">
  `).join('');

  thumbs.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => {
      main.src = img.dataset.src;
      thumbs.querySelectorAll('img').forEach(i => i.classList.remove('active'));
      img.classList.add('active');
    });
  });

  // Simple hover-zoom effect
  main.parentElement.addEventListener('mousemove', (e) => {
    const rect = main.parentElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    main.style.transformOrigin = `${x}% ${y}%`;
    main.style.transform = 'scale(1.5)';
  });
  main.parentElement.addEventListener('mouseleave', () => {
    main.style.transform = 'scale(1)';
  });
}

function renderProduct(product) {
  document.title = `${product.name} — Homeable`;
  document.getElementById('pdCategory').textContent = product.category_name;
  document.getElementById('pdName').textContent = product.name;
  document.getElementById('pdStars').innerHTML = renderStars(product.rating);
  document.getElementById('pdReviewCount').textContent = `(${product.review_count} reviews)`;
  document.getElementById('pdShortDesc').textContent = product.short_description || '';
  document.getElementById('pdDescription').textContent = product.description || '';
  document.getElementById('pdSpecs').innerHTML = (product.specifications || '').split('\n').filter(Boolean)
    .map(line => `<li>${escapeHTML(line)}</li>`).join('');

  const priceEl = document.getElementById('pdPrice');
  const onSale = product.compare_price && Number(product.compare_price) > Number(product.price);
  priceEl.innerHTML = `${formatPrice(product.price)} ${onSale ? `<span class="was">${formatPrice(product.compare_price)}</span>` : ''}`;

  const availEl = document.getElementById('pdAvailability');
  if (product.stock > 0) {
    availEl.innerHTML = `<span style="color: var(--color-success);"><i class="bi bi-check-circle"></i> In Stock</span> — ${product.stock} available`;
  } else {
    availEl.innerHTML = `<span style="color: var(--color-danger);"><i class="bi bi-x-circle"></i> Out of Stock</span>`;
  }

  document.getElementById('pdSku').textContent = product.sku;

  renderGallery(product);
}

function renderRelated(related) {
  const grid = document.getElementById('relatedGrid');
  if (!grid) return;
  grid.innerHTML = related.length
    ? related.map(productCardHTML).join('')
    : `<p class="text-muted">No related products.</p>`;
  initScrollReveal();
}

async function loadReviews(productId) {
  const list = document.getElementById('reviewsList');
  try {
    const { reviews } = await api.get(`/reviews/${productId}`);
    list.innerHTML = reviews.length
      ? reviews.map(r => `
        <div class="mb-4 pb-4" style="border-bottom:1px solid var(--color-line);">
          <div class="d-flex justify-content-between align-items-center mb-1">
          <strong>${escapeHTML(r.user_name)}</strong>
            <span style="color:#D9A441;">${renderStars(r.rating)}</span>
          </div>
          ${r.title ? `<div class="fw-medium mb-1">${escapeHTML(r.title)}</div>` : ''}
          <p class="text-muted mb-0">${escapeHTML(r.comment || '')}</p>
        </div>
      `).join('')
      : `<p class="text-muted">No reviews yet — be the first to share your thoughts.</p>`;
  } catch {
    list.innerHTML = `<p class="text-muted">Could not load reviews.</p>`;
  }
}

function initQuantitySelector() {
  const input = document.getElementById('pdQty');
  document.getElementById('qtyMinus').addEventListener('click', () => {
    currentQty = Math.max(1, currentQty - 1);
    input.value = currentQty;
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    const max = currentProduct ? currentProduct.stock : 99;
    currentQty = Math.min(max, currentQty + 1);
    input.value = currentQty;
  });
  input.addEventListener('change', () => {
    currentQty = Math.max(1, Number(input.value) || 1);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) {
    window.location.href = 'shop.html';
    return;
  }

  try {
    const { product, related } = await api.get(`/products/${slug}`);
    currentProduct = product;
    renderProduct(product);
    renderRelated(related);
    loadReviews(product.id);
    initQuantitySelector();

    document.getElementById('pdAddToCart').addEventListener('click', () => handleAddToCart(product.id, currentQty));
    document.getElementById('pdBuyNow').addEventListener('click', async () => {
      if (!getStoredUser()) {
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }
      try {
        await api.post('/cart', { productId: product.id, quantity: currentQty });
        refreshBadgeCounts();
        window.location.href = 'cart.html';
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
    document.getElementById('pdWishlist').addEventListener('click', (e) => {
      handleToggleWishlist(product.id, e.currentTarget);
    });

    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!getStoredUser()) {
          window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          return;
        }
        const rating = Number(document.querySelector('input[name="reviewRating"]:checked')?.value || 5);
        const title = document.getElementById('reviewTitle').value.trim();
        const comment = document.getElementById('reviewComment').value.trim();
        try {
          await api.post(`/reviews/${product.id}`, { rating, title, comment });
          showToast('Thanks for your review!', 'success');
          reviewForm.reset();
          loadReviews(product.id);
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    }
  } catch (err) {
    document.getElementById('pdContent').innerHTML = `<p class="text-muted">Product not found.</p>`;
  }
});
