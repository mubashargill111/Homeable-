/* ==========================================================================
   Homeable — Admin panel shared shell
   ========================================================================== */

function renderAdminSidebar(active) {
  const links = [
    { key: 'dashboard', href: '/admin/dashboard.html', icon: 'bi-grid', label: 'Dashboard' },
    { key: 'products', href: '/admin/products.html', icon: 'bi-box-seam', label: 'Products' },
    { key: 'categories', href: '/admin/categories.html', icon: 'bi-tags', label: 'Categories' },
    { key: 'orders', href: '/admin/orders.html', icon: 'bi-receipt', label: 'Orders' },
    { key: 'users', href: '/admin/users.html', icon: 'bi-people', label: 'Users' }
  ];
  return `
  <aside class="admin-sidebar">
    <a href="/admin/dashboard.html" class="brand-logo">Home<span style="color:#C8916A;">able</span></a>
    ${links.map(l => `
      <a href="${l.href}" class="${active === l.key ? 'active' : ''}"><i class="bi ${l.icon}"></i> ${l.label}</a>
    `).join('')}
    <hr style="border-color: rgba(255,255,255,0.15); margin: 20px 0;">
    <a href="/index.html"><i class="bi bi-arrow-left-circle"></i> Back to Store</a>
    <a href="#" data-logout><i class="bi bi-box-arrow-right"></i> Logout</a>
  </aside>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const shell = document.getElementById('adminShell');
  if (!shell) return;

  const user = requireAdmin();
  if (!user) return;

  const sidebarMount = document.getElementById('adminSidebarMount');
  const page = document.body.getAttribute('data-admin-page');
  if (sidebarMount) sidebarMount.innerHTML = renderAdminSidebar(page);

  const nameEl = document.getElementById('adminUserName');
  if (nameEl) nameEl.textContent = user.full_name;

  initLogoutButtons();
});
