/* ==========================================================================
   Homeable - Home page dynamic sections and hero slider
   ========================================================================== */

const fallbackCategories = [
  { name: 'Furniture', slug: 'furniture', product_count: 2, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop' },
  { name: 'Lighting', slug: 'lighting', product_count: 2, image: 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14?q=80&w=800&auto=format&fit=crop' },
  { name: 'Wall Art', slug: 'wall-art', product_count: 3, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop' },
  { name: 'Vases & Decor', slug: 'vases-decor', product_count: 2, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800&auto=format&fit=crop' },
  { name: 'Textiles', slug: 'textiles', product_count: 2, image: 'https://images.unsplash.com/photo-1615529162924-f8605388461d?q=80&w=800&auto=format&fit=crop' },
  { name: 'Tableware', slug: 'tableware', product_count: 2, image: 'https://images.unsplash.com/photo-1587080266227-677cc2a4e76e?q=80&w=800&auto=format&fit=crop' }
];

const fallbackProducts = [
  { id: 1, name: 'Bergen Ceramic Table Lamp', slug: 'bergen-ceramic-table-lamp', category_name: 'Lighting', price: 89, compare_price: 110, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop', rating: 4.9, review_count: 41, is_bestseller: 1 },
  { id: 2, name: 'Nora Oak Side Table', slug: 'nora-oak-side-table', category_name: 'Furniture', price: 210, compare_price: 260, image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop', rating: 4.8, review_count: 31, is_bestseller: 1 },
  { id: 3, name: 'Sculptural Stoneware Vase', slug: 'sculptural-stoneware-vase', category_name: 'Vases & Decor', price: 54, compare_price: 64, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800&auto=format&fit=crop', rating: 4.7, review_count: 22, is_new: 1 },
  { id: 4, name: 'Linen Lounge Armchair', slug: 'linen-lounge-armchair', category_name: 'Furniture', price: 480, compare_price: null, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop', rating: 4.9, review_count: 15, is_new: 1 },
  { id: 5, name: 'Stonewashed Linen Throw', slug: 'stonewashed-linen-throw', category_name: 'Textiles', price: 58, compare_price: 68, image: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?q=80&w=800&auto=format&fit=crop', rating: 4.7, review_count: 28, is_bestseller: 1 },
  { id: 6, name: 'Hand-Thrown Dinner Set', slug: 'hand-thrown-dinner-set', category_name: 'Tableware', price: 96, compare_price: 120, image: 'https://images.unsplash.com/photo-1587080266227-677cc2a4e76e?q=80&w=800&auto=format&fit=crop', rating: 4.8, review_count: 24, is_bestseller: 1 },
  { id: 7, name: 'Abstract Terracotta Study', slug: 'abstract-terracotta-study', category_name: 'Wall Art', price: 38, compare_price: null, image: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800&auto=format&fit=crop', rating: 4.6, review_count: 14, is_new: 1 },
  { id: 8, name: 'Amber Glass Bud Vase Set', slug: 'amber-glass-bud-vase-set', category_name: 'Vases & Decor', price: 46, compare_price: null, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop', rating: 4.6, review_count: 17, is_new: 1 }
];

function renderCategoryCards(categories) {
  return categories.slice(0, 6).map(c => `
    <a href="shop.html?category=${encodeURIComponent(c.slug)}" class="category-card reveal">
      <img src="${escapeAttr(c.image || 'images/placeholder.jpg')}" alt="${escapeAttr(c.name)}" loading="lazy">
      <span class="cat-label">${escapeHTML(c.name)}</span>
      <span class="cat-count">${c.product_count} items</span>
    </a>
  `).join('');
}

async function loadHomeCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;
  try {
    const { categories } = await api.get('/categories');
    grid.innerHTML = renderCategoryCards(categories);
  } catch {
    grid.innerHTML = renderCategoryCards(fallbackCategories);
  }
  initScrollReveal();
}

async function loadHomeProducts() {
  const sections = [
    { el: 'newArrivalsGrid', query: '?isNew=1&limit=4', fallback: fallbackProducts.filter(p => p.is_new).slice(0, 4) },
    { el: 'bestSellersGrid', query: '?bestseller=1&limit=4', fallback: fallbackProducts.filter(p => p.is_bestseller).slice(0, 4) },
    { el: 'featuredGrid', query: '?featured=1&limit=8', fallback: fallbackProducts }
  ];

  for (const s of sections) {
    const grid = document.getElementById(s.el);
    if (!grid) continue;
    try {
      const { rows } = await api.get(`/products${s.query}`);
      grid.innerHTML = rows.length ? rows.map(productCardHTML).join('') : s.fallback.map(productCardHTML).join('');
    } catch {
      grid.innerHTML = s.fallback.map(productCardHTML).join('');
    }
  }
  initScrollReveal();
}

function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.hero-slide')];
  const prev = slider.querySelector('.hero-prev');
  const next = slider.querySelector('.hero-next');
  if (slides.length <= 1) return;

  let index = 0;
  const show = (nextIndex) => {
    slides[index].classList.remove('active');
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add('active');
  };

  prev?.addEventListener('click', () => show(index - 1));
  next?.addEventListener('click', () => show(index + 1));
  setInterval(() => show(index + 1), 6500);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  loadHomeCategories();
  loadHomeProducts();
});
