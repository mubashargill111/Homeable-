/* ==========================================================================
   Homeable - Admin: Products CRUD
   ========================================================================== */

let adminCategories = [];
let editingProductId = null;

async function loadAdminCategoriesDropdown() {
  const { categories } = await api.get('/categories');
  adminCategories = categories;
  const select = document.getElementById('productCategorySelect');
  if (select) {
    select.innerHTML = categories.map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join('');
  }
}

async function loadAdminProducts() {
  const tbody = document.getElementById('productsTableBody');
  try {
    const { rows } = await api.get('/products?limit=100&status=active');
    tbody.innerHTML = rows.map(p => `
      <tr>
        <td><img src="${escapeAttr(p.image || 'images/placeholder.jpg')}" alt="${escapeAttr(p.name)}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;"></td>
        <td>${escapeHTML(p.name)}<div class="text-muted" style="font-size:12px;">${escapeHTML(p.sku)}</div></td>
        <td>${escapeHTML(p.category_name)}</td>
        <td>${formatPrice(p.price)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="btn btn-outline btn-sm edit-product-btn" data-id="${p.id}">Edit</button>
          <button class="btn btn-sm delete-product-btn" style="color:var(--color-danger);" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="6" class="text-muted">No products yet.</td></tr>`;

    tbody.querySelectorAll('.edit-product-btn').forEach(btn => {
      btn.addEventListener('click', () => openProductModal(rows.find(r => r.id === Number(btn.dataset.id))));
    });
    tbody.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.id)));
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-muted">${escapeHTML(err.message)}</td></tr>`;
  }
}

function openProductModal(product = null) {
  editingProductId = product ? product.id : null;
  document.getElementById('productModalTitle').textContent = product ? 'Edit Product' : 'Add Product';
  document.getElementById('productName').value = product?.name || '';
  document.getElementById('productCategorySelect').value = product?.category_id || '';
  document.getElementById('productSku').value = product?.sku || '';
  document.getElementById('productPrice').value = product?.price || '';
  document.getElementById('productComparePrice').value = product?.compare_price || '';
  document.getElementById('productStock').value = product?.stock ?? 0;
  document.getElementById('productShortDesc').value = product?.short_description || '';
  document.getElementById('productDescription').value = product?.description || '';
  document.getElementById('productSpecs').value = product?.specifications || '';
  document.getElementById('productFeatured').checked = !!product?.is_featured;
  document.getElementById('productNew').checked = !!product?.is_new;
  document.getElementById('productBestseller').checked = !!product?.is_bestseller;
  document.getElementById('productImageFile').value = '';

  new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await api.delete(`/products/${id}`);
    showToast('Product deleted.', 'success');
    loadAdminProducts();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('adminProductsRoot');
  if (!root) return;

  loadAdminCategoriesDropdown();
  loadAdminProducts();

  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());

  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('category_id', document.getElementById('productCategorySelect').value);
    formData.append('name', document.getElementById('productName').value.trim());
    formData.append('sku', document.getElementById('productSku').value.trim());
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('compare_price', document.getElementById('productComparePrice').value || '');
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('short_description', document.getElementById('productShortDesc').value.trim());
    formData.append('description', document.getElementById('productDescription').value.trim());
    formData.append('specifications', document.getElementById('productSpecs').value.trim());
    formData.append('is_featured', document.getElementById('productFeatured').checked ? '1' : '0');
    formData.append('is_new', document.getElementById('productNew').checked ? '1' : '0');
    formData.append('is_bestseller', document.getElementById('productBestseller').checked ? '1' : '0');
    const file = document.getElementById('productImageFile').files[0];
    if (file) formData.append('image', file);

    try {
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, formData, { isFormData: true });
        showToast('Product updated.', 'success');
      } else {
        await api.post('/products', formData, { isFormData: true });
        showToast('Product created.', 'success');
      }
      bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
      loadAdminProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
});
