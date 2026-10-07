/* ==========================================================================
   Homeable — Auth forms (login / register / forgot / reset)
   ========================================================================== */

function redirectAfterAuth(user) {
  const redirectTo = new URLSearchParams(window.location.search).get('redirect');
  if (redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')) {
    return (window.location.href = redirectTo);
  }
  window.location.href = user.role === 'admin' ? 'admin/dashboard.html' : 'dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Login ----------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = loginForm.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Signing in...';
      try {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const res = await api.post('/auth/login', { email, password });
        setToken(res.token);
        setStoredUser(res.user);
        showToast(`Welcome back, ${res.user.full_name.split(' ')[0]}!`, 'success');
        setTimeout(() => redirectAfterAuth(res.user), 500);
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = original;
      }
    });
  }

  // ---------- Register ----------
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector('button[type="submit"]');
      const original = btn.innerHTML;

      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (password !== confirmPassword) {
        return showToast('Passwords do not match.', 'error');
      }

      btn.disabled = true;
      btn.innerHTML = 'Creating account...';
      try {
        const full_name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const res = await api.post('/auth/register', { full_name, email, password, phone });
        setToken(res.token);
        setStoredUser(res.user);
        showToast('Account created - welcome to Homeable!', 'success');
        setTimeout(() => redirectAfterAuth(res.user), 500);
      } catch (err) {
        showToast(err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = original;
      }
    });
  }

  // ---------- Forgot password ----------
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      try {
        const res = await api.post('/auth/forgot-password', { email });
        const resultBox = document.getElementById('forgotResult');
        if (resultBox) {
          resultBox.style.display = 'block';
          if (res.resetToken) {
            resultBox.innerHTML = `Reset token generated (demo mode, normally emailed):<br>
              <code style="word-break:break-all;">${res.resetToken}</code><br>
              <a href="reset-password.html?token=${res.resetToken}" class="text-accent">Continue to reset password &rarr;</a>`;
          } else {
            resultBox.textContent = res.message;
          }
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }

  // ---------- Reset password ----------
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    const token = new URLSearchParams(window.location.search).get('token') || '';
    const tokenInput = document.getElementById('resetToken');
    if (tokenInput) tokenInput.value = token;

    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmNewPassword').value;
      if (password !== confirmPassword) return showToast('Passwords do not match.', 'error');

      try {
        const res = await api.post('/auth/reset-password', { token: tokenInput.value, password });
        showToast(res.message, 'success');
        setTimeout(() => (window.location.href = 'login.html'), 1200);
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
});

/** Guard a page so it requires login. Redirects to /login.html if not authenticated. */
function requireAuth() {
  const user = getStoredUser();
  if (!user || !getToken()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return null;
  }
  return user;
}

/** Guard a page so it requires an admin account. */
function requireAdmin() {
  const user = requireAuth();
  if (user && user.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return null;
  }
  return user;
}
