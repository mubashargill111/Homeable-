/* ==========================================================================
   Homeable — Admin Dashboard analytics
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('adminDashboardRoot');
  if (!root) return;

  try {
    const { stats } = await api.get('/admin/dashboard');

    document.getElementById('statRevenue').textContent = formatPrice(stats.total_revenue);
    document.getElementById('statOrders').textContent = stats.total_orders;
    document.getElementById('statUsers').textContent = stats.total_users;
    document.getElementById('statProducts').textContent = stats.total_products;

    const statusBreakdown = document.getElementById('statusBreakdown');
    statusBreakdown.innerHTML = stats.byStatus.map(s => `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="status-pill status-${escapeAttr(s.status)}">${escapeHTML(s.status)}</span>
        <strong>${s.count}</strong>
      </div>
    `).join('') || '<p class="text-muted">No orders yet.</p>';

    const recentOrders = document.getElementById('recentOrdersTable');
    recentOrders.innerHTML = stats.recentOrders.map(o => `
      <tr>
        <td>${escapeHTML(o.order_number)}</td>
        <td>${escapeHTML(o.customer_name)}</td>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td><span class="status-pill status-${escapeAttr(o.status)}">${escapeHTML(o.status)}</span></td>
        <td>${formatPrice(o.total)}</td>
      </tr>
    `).join('') || `<tr><td colspan="5" class="text-muted">No orders yet.</td></tr>`;
  } catch (err) {
    root.innerHTML = `<p class="text-muted">${escapeHTML(err.message)}</p>`;
  }
});
