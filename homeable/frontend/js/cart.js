/* ==========================================================================
   Homeable — Cart page
   ========================================================================== */

const SHIPPING_FLAT_RATE = 10.0;
const FREE_SHIPPING_THRESHOLD = 150.0;
const TAX_RATE = 0.05;

function renderCartLine(item) {
  return `
  <div class="cart-line" data-product-id="${item.product_id}">
    <img src="${escapeAttr(item.image || 'images/placeholder.jpg')}" alt="${escapeAttr(item.name)}">
    <div>
      <h5 style="font-family: var(--font-display); font-size: 16px; margin-bottom: 4px;">
        <a href="/product-details.html?slug=${encodeURIComponent(item.slug)}">${escapeHTML(item.name)}</a>
      </h5>
      <span class="text-muted" style="font-size:13px;">${formatPrice(item.price)} each</span>
    </div>
    <div class="qty-selector" style="height:40px;">
      <button type="button" class="cart-qty-minus">−</button>
      <input type="number" min="1" value="${item.quantity}" class="cart-qty-input">
      <button type="button" class="cart-qty-plus">+</button>
    </div>
    <strong>${formatPrice(item.price * item.quantity)}</strong>
    <button type="button" class="btn-icon cart-remove-btn" title="Remove item"><i class="bi bi-trash"></i></button>
  </div>`;
}

function renderSummary(subtotal, discount = 0) {
  const shippingFee = (subtotal - discount) >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + shippingFee + tax;

  document.getElementById('summarySubtotal').textContent = formatPrice(subtotal);
  document.getElementById('summaryDiscount').textContent = discount > 0 ? `-${formatPrice(discount)}` : formatPrice(0);
  document.getElementById('summaryShipping').textContent = shippingFee === 0 ? 'Free' : formatPrice(shippingFee);
  document.getElementById('summaryTax').textContent = formatPrice(tax);
  document.getElementById('summaryTotal').textContent = formatPrice(total);

  return { shippingFee, tax, total };
}

let appliedDiscountRate = 0;

async function loadCart() {
  const container = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const summaryBox = document.getElementById('cartSummaryBox');

  try {
    const { items, subtotal } = await api.get('/cart');
    if (!items.length) {
      container.innerHTML = '';
      empty.style.display = 'block';
      summaryBox.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    summaryBox.style.display = 'block';
    container.innerHTML = items.map(renderCartLine).join('');
    
    // Dynamically calculate the discount based on the rate and subtotal
    const discount = Number((subtotal * appliedDiscountRate).toFixed(2));
    renderSummary(subtotal, discount);
  } catch (err) {
    container.innerHTML = `<p class="text-muted">${escapeHTML(err.message)}</p>`;
  }
}

document.addEventListener('click', async (e) => {
  const line = e.target.closest('.cart-line');
  if (!line) return;
  const productId = Number(line.dataset.productId);

  if (e.target.closest('.cart-qty-minus') || e.target.closest('.cart-qty-plus')) {
    const input = line.querySelector('.cart-qty-input');
    let qty = Number(input.value);
    qty = e.target.closest('.cart-qty-minus') ? Math.max(1, qty - 1) : qty + 1;
    input.value = qty;
    try {
      await api.put(`/cart/${productId}`, { quantity: qty });
      loadCart();
      refreshBadgeCounts();
    } catch (err) { showToast(err.message, 'error'); }
  }

  if (e.target.closest('.cart-remove-btn')) {
    try {
      await api.delete(`/cart/${productId}`);
      showToast('Item removed from cart.');
      loadCart();
      refreshBadgeCounts();
    } catch (err) { showToast(err.message, 'error'); }
  }
});

document.addEventListener('change', async (e) => {
  if (!e.target.classList.contains('cart-qty-input')) return;
  const line = e.target.closest('.cart-line');
  const productId = Number(line.dataset.productId);
  const qty = Math.max(1, Number(e.target.value) || 1);
  try {
    await api.put(`/cart/${productId}`, { quantity: qty });
    loadCart();
    refreshBadgeCounts();
  } catch (err) { showToast(err.message, 'error'); }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('cartItems')) return;
  loadCart();

  const couponForm = document.getElementById('couponForm');
  if (couponForm) {
    couponForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('couponInput').value.trim().toUpperCase();
      if (code === 'WELCOME10') {
        appliedDiscountRate = 0.1;
        loadCart();
        showToast('Coupon applied — 10% off!', 'success');
      } else {
        showToast('Invalid coupon code.', 'error');
      }
    });
  }
});
