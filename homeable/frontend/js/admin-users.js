/* ==========================================================================
   Homeable - Admin: Users management
   ========================================================================== */

async function loadAdminUsers() {
  const tbody = document.getElementById('usersTableBody');
  try {
    const { rows } = await api.get('/admin/users?limit=100');
    const me = getStoredUser();
    tbody.innerHTML = rows.map(u => `
      <tr>
        <td>${escapeHTML(u.full_name)}</td>
        <td>${escapeHTML(u.email)}</td>
        <td>${escapeHTML(u.phone || '-')}</td>
        <td>
          <select class="form-select form-select-sm role-select" data-id="${u.id}" style="width:130px;" ${u.id === me.id ? 'disabled' : ''}>
            <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>Customer</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td>${new Date(u.created_at).toLocaleDateString()}</td>
        <td>
          <button class="btn btn-sm delete-user-btn" style="color:var(--color-danger);" data-id="${u.id}" ${u.id === me.id ? 'disabled' : ''}>Delete</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="6" class="text-muted">No users found.</td></tr>`;

    tbody.querySelectorAll('.role-select').forEach(select => {
      select.addEventListener('change', async () => {
        try {
          await api.put(`/admin/users/${select.dataset.id}/role`, { role: select.value });
          showToast('User role updated.', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });
    tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteUser(Number(btn.dataset.id)));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">${escapeHTML(err.message)}</td></tr>`;
  }
}

async function deleteUser(id) {
  if (!confirm('Delete this user account? This cannot be undone.')) return;
  try {
    await api.delete(`/admin/users/${id}`);
    showToast('User deleted.', 'success');
    loadAdminUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('adminUsersRoot');
  if (!root) return;
  loadAdminUsers();
});
