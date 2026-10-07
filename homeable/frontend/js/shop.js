/* ==========================================================================
   Homeable - Shop page: filters, sort, search, pagination
   ========================================================================== */

const shopFallbackCategories = [
  { name: 'Furniture', slug: 'furniture', product_count: 2 },
  { name: 'Lighting', slug: 'lighting', product_count: 2 },
  { name: 'Wall Art', slug: 'wall-art', product_count: 2 },
  { name: 'Vases & Decor', slug: 'vases-decor', product_count: 2 },
  { name: 'Textiles', slug: 'textiles', product_count: 1 },
  { name: 'Tableware', slug: 'tableware', product_count: 1 }
];

const shopFallbackProducts = [
  { id: 1, name: 'Bergen Ceramic Table Lamp', slug: 'bergen-ceramic-table-lamp', category_name: 'Lighting', category_slug: 'lighting', price: 89, compare_price: 110, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop', rating: 4.9, review_count: 41, is_bestseller: 1, is_featured: 1 },
  { id: 2, name: 'Oslo Pendant Light', slug: 'oslo-pendant-light', category_name: 'Lighting', category_slug: 'lighting', price: 76, compare_price: null, image: 'https://images.unsplash.com/photo-1543198126-c0b6a0a4a1e0?q=80&w=800&auto=format&fit=crop', rating: 4.5, review_count: 9, is_new: 1 },
  { id: 3, name: 'Nora Oak Side Table', slug: 'nora-oak-side-table', category_name: 'Furniture', category_slug: 'furniture', price: 210, compare_price: 260, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop', rating: 4.8, review_count: 31, is_bestseller: 1, is_featured: 1 },
  { id: 4, name: 'Linen Lounge Armchair', slug: 'linen-lounge-armchair', category_name: 'Furniture', category_slug: 'furniture', price: 480, compare_price: null, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop', rating: 4.9, review_count: 15, is_new: 1, is_featured: 1 },
  { id: 5, name: 'Sculptural Stoneware Vase', slug: 'sculptural-stoneware-vase', category_name: 'Vases & Decor', category_slug: 'vases-decor', price: 54, compare_price: 64, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800&auto=format&fit=crop', rating: 4.7, review_count: 22, is_featured: 1 },
  { id: 6, name: 'Amber Glass Bud Vase Set', slug: 'amber-glass-bud-vase-set', category_name: 'Vases & Decor', category_slug: 'vases-decor', price: 46, compare_price: null, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop', rating: 4.6, review_count: 17, is_new: 1, is_bestseller: 1 },
  { id: 7, name: 'Linework Portrait Print', slug: 'linework-portrait-print', category_name: 'Wall Art', category_slug: 'wall-art', price: 32, compare_price: 42, image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop', rating: 4.8, review_count: 26, is_bestseller: 1 },
  { id: 8, name: 'Abstract Terracotta Study', slug: 'abstract-terracotta-study', category_name: 'Wall Art', category_slug: 'wall-art', price: 38, compare_price: null, image: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800&auto=format&fit=crop', rating: 4.6, review_count: 14, is_new: 1 },
  { id: 9, name: 'Stonewashed Linen Throw', slug: 'stonewashed-linen-throw', category_name: 'Textiles', category_slug: 'textiles', price: 58, compare_price: 68, image: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?q=80&w=800&auto=format&fit=crop', rating: 4.7, review_count: 28, is_bestseller: 1 },
  { id: 10, name: 'Hand-Thrown Dinner Set', slug: 'hand-thrown-dinner-set', category_name: 'Tableware', category_slug: 'tableware', price: 96, compare_price: 120, image: 'https://images.unsplash.com/photo-1587080266227-677cc2a4e76e?q=80&w=800&auto=format&fit=crop', rating: 4.8, review_count: 24, is_featured: 1 }
];

const shopState = {
  page: 1,
  limit: 12,
  category: '',
  minPrice: '',
  maxPrice: '',
  search: '',
  sort: 'newest',
  featured: false,
  isNew: false,
  bestseller: false
};

function syncStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (document.body.getAttribute('data-page') === 'new-arrivals') shopState.isNew = true;
  if (params.get('category')) shopState.category = params.get('category');
  if (params.get('search')) shopState.search = params.get('search');
  const filter = params.get('filter');
  if (filter === 'new') shopState.isNew = true;
  if (filter === 'bestseller') shopState.bestseller = true;
  if (filter === 'featured') shopState.featured = true;
}

function renderCategoryFilters(categories) {
  const container = document.getElementById('categoryFilters');
  if (!container) return;
  container.innerHTML = `
    <label class="filter-check">
      <input type="radio" name="categoryFilter" value="" ${shopState.category === '' ? 'checked' : ''}>
      All Categories
    </label>
  ` + categories.map(c => `
    <label class="filter-check">
      <input type="radio" name="categoryFilter" value="${escapeAttr(c.slug)}" ${shopState.category === c.slug ? 'checked' : ''}>
      ${escapeHTML(c.name)} <span class="text-muted">(${c.product_count})</span>
    </label>
  `).join('');

  container.querySelectorAll('input[name="categoryFilter"]').forEach(input => {
    input.addEventListener('change', () => {
      shopState.category = input.value;
      shopState.page = 1;
      loadProducts();
    });
  });
}

async function loadCategoryFilters() {
  try {
    const { categories } = await api.get('/categories');
    renderCategoryFilters(categories);
  } catch {
    renderCategoryFilters(shopFallbackCategories);
  }
}

function buildQueryString() {
  const q = { page: shopState.page, limit: shopState.limit, sort: shopState.sort };
  if (shopState.category) q.category = shopState.category;
  if (shopState.minPrice) q.minPrice = shopState.minPrice;
  if (shopState.maxPrice) q.maxPrice = shopState.maxPrice;
  if (shopState.search) q.search = shopState.search;
  if (shopState.featured) q.featured = 1;
  if (shopState.isNew) q.isNew = 1;
  if (shopState.bestseller) q.bestseller = 1;
  return new URLSearchParams(q).toString();
}

function getFallbackProducts() {
  let rows = [...shopFallbackProducts];
  if (shopState.category) rows = rows.filter(p => p.category_slug === shopState.category);
  if (shopState.minPrice) rows = rows.filter(p => Number(p.price) >= Number(shopState.minPrice));
  if (shopState.maxPrice) rows = rows.filter(p => Number(p.price) <= Number(shopState.maxPrice));
  if (shopState.featured) rows = rows.filter(p => p.is_featured);
  if (shopState.isNew) rows = rows.filter(p => p.is_new);
  if (shopState.bestseller) rows = rows.filter(p => p.is_bestseller);
  if (shopState.search) {
    const term = shopState.search.toLowerCase();
    rows = rows.filter(p => `${p.name} ${p.category_name}`.toLowerCase().includes(term));
  }
  if (shopState.sort === 'price-low') rows.sort((a, b) => a.price - b.price);
  if (shopState.sort === 'price-high') rows.sort((a, b) => b.price - a.price);
  if (shopState.sort === 'popular') rows.sort((a, b) => b.review_count - a.review_count);
  return rows;
}

function renderProductResults(rows, total = rows.length, page = 1, totalPages = 1) {
  const grid = document.getElementById('productsGrid');
  const resultCount = document.getElementById('resultCount');
  if (!grid) return;

  if (!rows.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <div class="icon"><i class="bi bi-search"></i></div>
        <h4>No products found</h4>
        <p class="text-muted">Try adjusting your filters or search terms.</p>
      </div>`;
  } else {
    grid.innerHTML = rows.map(productCardHTML).join('');
  }

  if (resultCount) resultCount.textContent = `${total} product${total !== 1 ? 's' : ''}`;
  renderPagination(totalPages, page);
  initScrollReveal();
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = `<div class="spinner-luxe"></div>`;

  try {
    const data = await api.get(`/products?${buildQueryString()}`);
    renderProductResults(data.rows, data.total, data.page, data.totalPages);
  } catch {
    const rows = getFallbackProducts();
    renderProductResults(rows);
  }
}

function renderPagination(totalPages, currentPage) {
  const el = document.getElementById('pagination');
  if (!el) return;
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<li><button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button></li>`;
  }
  el.innerHTML = html;
  el.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      shopState.page = Number(btn.dataset.page);
      loadProducts();
      window.scrollTo({ top: document.getElementById('productsGrid').offsetTop - 120, behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  syncStateFromURL();
  loadCategoryFilters();

  const searchInput = document.getElementById('shopSearchInput');
  if (searchInput) {
    searchInput.value = shopState.search;
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        shopState.search = searchInput.value.trim();
        shopState.page = 1;
        loadProducts();
      }
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      shopState.sort = sortSelect.value;
      loadProducts();
    });
  }

  const priceForm = document.getElementById('priceFilterForm');
  if (priceForm) {
    priceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      shopState.minPrice = document.getElementById('minPrice').value;
      shopState.maxPrice = document.getElementById('maxPrice').value;
      shopState.page = 1;
      loadProducts();
    });
  }

  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      Object.assign(shopState, { page: 1, category: '', minPrice: '', maxPrice: '', search: '', featured: false, isNew: false, bestseller: false });
      if (searchInput) searchInput.value = '';
      if (priceForm) priceForm.reset();
      loadCategoryFilters();
      loadProducts();
    });
  }

  loadProducts();
});
