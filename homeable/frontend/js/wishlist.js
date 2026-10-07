/* ==========================================================================
   Homeable — Wishlist page
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('wishlistGrid');
  if (!grid) return;

  const user = requireAuth();
  if (!user) return;

  async function load() {
    try {
      const { items } = await api.get('/wishlist');
      const empty = document.getElementById('wishlistEmpty');
      if (!items.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
      }
      empty.style.display = 'none';
      grid.innerHTML = items.map(p => productCardHTML({ ...p, category_name: '' })).join('');
      grid.querySelectorAll('.wishlist-btn').forEach(btn => btn.classList.add('active'));
      initScrollReveal();
    } catch (err) {
      grid.innerHTML = `<p class="text-muted">${escapeHTML(err.message)}</p>`;
    }
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-btn');
    if (btn && btn.classList.contains('active')) {
      setTimeout(load, 400); // re-render after removal
    }
  });

  load();
});
