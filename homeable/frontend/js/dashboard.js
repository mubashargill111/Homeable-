/* ==========================================================================
   Homeable - Customer Dashboard
   ========================================================================== */

function statusPillHTML(status) {
  const safeStatus = escapeAttr(status);
  return `<span class="status-pill status-${safeStatus}">${escapeHTML(status)}</span>`;
}

async function loadProfile(user) {
  const nameEl = document.getElementById('profileFullName');
  const emailEl = document.getElementById('profileEmail');
  const phoneEl = document.getElementById('profilePhone');
  if (nameEl) nameEl.value = user.full_name;
  if (emailEl) emailEl.value = user.email;
  if (phoneEl) phoneEl.value = user.phone || '';

  const greeting = document.getElementById('dashGreeting');
  if (greeting) greeting.textContent = `Welcome back, ${user.full_name.split(' ')[0]}`;
}

async function loadOrders() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  try {
    const { orders } = await api.get('/orders/my-orders');
    container.innerHTML = orders.length ? orders.map(o => `
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2" style="padding:18px 0; border-bottom:1px solid var(--color-line);">
        <div>
          <strong>${escapeHTML(o.order_number)}</strong>
          <div class="text-muted" style="font-size:13px;">${new Date(o.created_at).toLocaleDateString()} · ${o.payment_method === 'cod' ? 'Cash on Delivery' : 'Credit Card'}</div>
        </div>
        ${statusPillHTML(o.status)}
        <strong>${formatPrice(o.total)}</strong>
        <a href="/order-confirmation.html?id=${encodeURIComponent(o.id)}" class="btn btn-outline btn-sm">View</a>
      </div>
    `).join('') : `<p class="text-muted">You haven't placed any orders yet.</p>`;
  } catch (err) {
    container.innerHTML = `<p class="text-muted">${escapeHTML(err.message)}</p>`;
  }
}

async function loadAddresses() {
  const container = document.getElementById('addressList');
  if (!container) return;
  try {
    const { addresses } = await api.get('/users/addresses');
    container.innerHTML = addresses.length ? addresses.map(a => `
      <div class="p-3 mb-3 rounded-luxe shadow-luxe" style="border:1px solid var(--color-line);">
        <div class="d-flex justify-content-between">
          <strong>${escapeHTML(a.label)} ${a.is_default ? '<span class="text-accent">(Default)</span>' : ''}</strong>
          <button class="btn-icon remove-address-btn" data-id="${a.id}" title="Remove address"><i class="bi bi-trash"></i></button>
        </div>
        <p class="text-muted mb-0" style="font-size:14px;">${escapeHTML(a.full_name)}, ${escapeHTML(a.phone)}<br>${escapeHTML(a.address_line1)}${a.address_line2 ? ', ' + escapeHTML(a.address_line2) : ''}<br>${escapeHTML(a.city)}, ${escapeHTML(a.state)} ${escapeHTML(a.postal_code)}, ${escapeHTML(a.country)}</p>
      </div>
    `).join('') : `<p class="text-muted">No saved addresses yet.</p>`;

    container.querySelectorAll('.remove-address-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await api.delete(`/users/addresses/${btn.dataset.id}`);
          showToast('Address removed.');
          loadAddresses();
        } catch (err) { showToast(err.message, 'error'); }
      });
    });
  } catch (err) {
    container.innerHTML = `<p class="text-muted">${escapeHTML(err.message)}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const dashRoot = document.getElementById('dashboardRoot');
  if (!dashRoot) return;

  const user = requireAuth();
  if (!user) return;

  loadProfile(user);
  loadOrders();
  loadAddresses();

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await api.put('/users/profile', {
          full_name: document.getElementById('profileFullName').value.trim(),
          phone: document.getElementById('profilePhone').value.trim()
        });
        setStoredUser({ ...user, ...res.user });
        showToast('Profile updated.', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPasswordDash').value;
      const confirm = document.getElementById('confirmPasswordDash').value;
      if (newPassword !== confirm) return showToast('New passwords do not match.', 'error');
      try {
        const res = await api.put('/users/change-password', { currentPassword, newPassword });
        showToast(res.message, 'success');
        passwordForm.reset();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }

  const addressForm = document.getElementById('addressForm');
  if (addressForm) {
    addressForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        label: document.getElementById('addrLabel').value.trim() || 'Home',
        full_name: document.getElementById('addrFullName').value.trim(),
        phone: document.getElementById('addrPhone').value.trim(),
        address_line1: document.getElementById('addrLine1').value.trim(),
        address_line2: document.getElementById('addrLine2').value.trim(),
        city: document.getElementById('addrCity').value.trim(),
        state: document.getElementById('addrState').value.trim(),
        postal_code: document.getElementById('addrPostal').value.trim(),
        country: document.getElementById('addrCountry').value.trim() || 'Pakistan',
        is_default: document.getElementById('addrDefault').checked
      };
      try {
        await api.post('/users/addresses', data);
        showToast('Address added.', 'success');
        addressForm.reset();
        loadAddresses();
        bootstrap.Modal.getInstance(document.getElementById('addAddressModal'))?.hide();
      } catch (err) { showToast(err.message, 'error'); }
    });
  }
});
