/* ==========================================================================
   Homeable — Checkout page
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const user = requireAuth();
  if (!user) return;

  // Prefill known info
  document.getElementById('billingName').value = user.full_name || '';
  document.getElementById('billingPhone').value = user.phone || '';

  async function loadOrderReview() {
    try {
      const { items, subtotal } = await api.get('/cart');
      if (!items.length) {
        showToast('Your cart is empty.', 'error');
        window.location.href = 'cart.html';
        return;
      }
      const list = document.getElementById('checkoutItems');
      list.innerHTML = items.map(i => `
        <div class="d-flex justify-content-between align-items-center mb-2" style="font-size:14px;">
          <span>${escapeHTML(i.name)} x ${i.quantity}</span>
          <strong>${formatPrice(i.price * i.quantity)}</strong>
        </div>
      `).join('');

      const shippingFee = subtotal >= 150 ? 0 : 10;
      const tax = subtotal * 0.05;
      const total = subtotal + shippingFee + tax;

      document.getElementById('checkoutSubtotal').textContent = formatPrice(subtotal);
      document.getElementById('checkoutShipping').textContent = shippingFee === 0 ? 'Free' : formatPrice(shippingFee);
      document.getElementById('checkoutTax').textContent = formatPrice(tax);
      document.getElementById('checkoutTotal').textContent = formatPrice(total);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  loadOrderReview();

  // Same as billing toggle
  const sameAsBilling = document.getElementById('sameAsBilling');
  const shippingFields = document.getElementById('shippingFields');
  sameAsBilling.addEventListener('change', () => {
    shippingFields.style.display = sameAsBilling.checked ? 'none' : 'block';
  });

  // Payment method toggle UI
  document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
      radio.closest('.payment-option').classList.add('selected');
      document.getElementById('creditCardFields').style.display = radio.value === 'credit_card' ? 'block' : 'none';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Placing order…';

    const billing = {
      name: document.getElementById('billingName').value.trim(),
      phone: document.getElementById('billingPhone').value.trim(),
      address: document.getElementById('billingAddress').value.trim()
    };
    const shipping = sameAsBilling.checked ? billing : {
      name: document.getElementById('shippingName').value.trim(),
      phone: document.getElementById('shippingPhone').value.trim(),
      address: document.getElementById('shippingAddress').value.trim()
    };
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const couponCode = document.getElementById('checkoutCoupon')?.value.trim() || '';

    try {
      const res = await api.post('/orders/checkout', { billing, shipping, paymentMethod, couponCode });
      refreshBadgeCounts();
      window.location.href = `order-confirmation.html?order=${res.order.order_number}&id=${res.order.id}`;
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
});
