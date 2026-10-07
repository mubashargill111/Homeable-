/* ==========================================================================
   Homeable - Admin: Orders management
   ========================================================================== */

async function loadAdminOrders(status = '') {
  const tbody = document.getElementById('ordersTableBody');
  try {
    const query = status ? `?status=${encodeURIComponent(status)}&limit=100` : '?limit=100';
    const { rows } = await api.get(`/orders/all${query}`);
    tbody.innerHTML = rows.map(o => `
      <tr>
        <td>${escapeHTML(o.order_number)}</td>
        <td>${escapeHTML(o.customer_name)}<div class="text-muted" style="font-size:12px;">${escapeHTML(o.customer_email)}</div></td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td>${o.payment_method === 'cod' ? 'COD' : 'Card'} · <span class="status-pill status-${o.payment_status === 'paid' ? 'delivered' : 'pending'}">${escapeHTML(o.payment_status)}</span></td>
        <td>${formatPrice(o.total)}</td>
        <td>
          <select class="form-select form-select-sm order-status-select" data-id="${o.id}" style="width:140px;">
            ${['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="6" class="text-muted">No orders found.</td></tr>`;

    tbody.querySelectorAll('.order-status-select').forEach(select => {
      select.addEventListener('change', async () => {
        try {
          await api.put(`/orders/${select.dataset.id}/status`, { status: select.value });
          showToast('Order status updated.', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">${escapeHTML(err.message)}</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('adminOrdersRoot');
  if (!root) return;

  loadAdminOrders();

  const filterSelect = document.getElementById('orderStatusFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => loadAdminOrders(filterSelect.value));
  }
});
