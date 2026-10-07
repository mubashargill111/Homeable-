/* ==========================================================================
   Homeable — Order confirmation page
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('confirmationRoot');
  if (!container) return;

  const user = requireAuth();
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('id');
  const orderNumber = params.get('order');

  if (!orderId) {
    container.innerHTML = `<p class="text-muted">No order specified.</p>`;
    return;
  }

  try {
    const { order } = await api.get(`/orders/${orderId}`);
    document.getElementById('confOrderNumber').textContent = order.order_number || orderNumber;
    document.getElementById('confDate').textContent = new Date(order.created_at).toLocaleString();
    document.getElementById('confPayment').textContent = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit Card';
    document.getElementById('confStatus').innerHTML = `<span class="status-pill status-${escapeAttr(order.status)}">${escapeHTML(order.status)}</span>`;
    document.getElementById('confShippingAddress').textContent = `${order.shipping_name}, ${order.shipping_phone}\n${order.shipping_address}`;

    document.getElementById('confItems').innerHTML = order.items.map(i => `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span>${escapeHTML(i.product_name)} x ${i.quantity}</span>
        <strong>${formatPrice(i.line_total)}</strong>
      </div>
    `).join('');

    document.getElementById('confSubtotal').textContent = formatPrice(order.subtotal);
    document.getElementById('confShipping').textContent = Number(order.shipping_fee) === 0 ? 'Free' : formatPrice(order.shipping_fee);
    document.getElementById('confTax').textContent = formatPrice(order.tax);
    document.getElementById('confDiscount').textContent = order.discount > 0 ? `-${formatPrice(order.discount)}` : formatPrice(0);
    document.getElementById('confTotal').textContent = formatPrice(order.total);
  } catch (err) {
    container.innerHTML = `<p class="text-muted">${escapeHTML(err.message)}</p>`;
  }
});
