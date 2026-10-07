/* ==========================================================================
   Homeable - Admin: Categories CRUD
   ========================================================================== */

let editingCategoryId = null;

async function loadAdminCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  try {
    const { categories } = await api.get('/categories');
    tbody.innerHTML = categories.map(c => `
      <tr>
        <td><img src="${escapeAttr(c.image || 'images/placeholder.jpg')}" alt="${escapeAttr(c.name)}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;"></td>
        <td>${escapeHTML(c.name)}</td>
        <td class="text-muted">${escapeHTML(c.description || '-')}</td>
        <td>${c.product_count}</td>
        <td>
          <button class="btn btn-outline btn-sm edit-cat-btn" data-id="${c.id}">Edit</button>
          <button class="btn btn-sm delete-cat-btn" style="color:var(--color-danger);" data-id="${c.id}">Delete</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="5" class="text-muted">No categories yet.</td></tr>`;

    tbody.querySelectorAll('.edit-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => openCategoryModal(categories.find(c => c.id === Number(btn.dataset.id))));
    });
    tbody.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteCategory(Number(btn.dataset.id)));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">${escapeHTML(err.message)}</td></tr>`;
  }
}

function openCategoryModal(category = null) {
  editingCategoryId = category ? category.id : null;
  document.getElementById('categoryModalTitle').textContent = category ? 'Edit Category' : 'Add Category';
  document.getElementById('categoryName').value = category?.name || '';
  document.getElementById('categoryDescription').value = category?.description || '';
  document.getElementById('categoryImage').value = category?.image || '';
  new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

async function deleteCategory(id) {
  if (!confirm('Delete this category? Products in it will need reassigning first.')) return;
  try {
    await api.delete(`/categories/${id}`);
    showToast('Category deleted.', 'success');
    loadAdminCategories();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('adminCategoriesRoot');
  if (!root) return;

  loadAdminCategories();
  document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());

  document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('categoryName').value.trim(),
      description: document.getElementById('categoryDescription').value.trim(),
      image: document.getElementById('categoryImage').value.trim()
    };
    try {
      if (editingCategoryId) {
        await api.put(`/categories/${editingCategoryId}`, data);
        showToast('Category updated.', 'success');
      } else {
        await api.post('/categories', data);
        showToast('Category created.', 'success');
      }
      bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
      loadAdminCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
});
