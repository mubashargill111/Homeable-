/* Toast notifications */
(function () {
  let wrap = document.querySelector('.toast-luxe-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-luxe-wrap';
    document.body.appendChild(wrap);
  }

  window.showToast = function (message, type = 'default') {
    const el = document.createElement('div');
    el.className = `toast-luxe ${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(30px)';
      setTimeout(() => el.remove(), 300);
    }, 3200);
  };
})();
