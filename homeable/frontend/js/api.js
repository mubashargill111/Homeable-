/* ==========================================================================
   Homeable — API client
   Thin wrapper around fetch() that talks to the Express/MySQL backend.
   ========================================================================== */

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('homeable_token');
}

function setToken(token) {
  if (token) localStorage.setItem('homeable_token', token);
}

function clearToken() {
  localStorage.removeItem('homeable_token');
  localStorage.removeItem('homeable_user');
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('homeable_user') || 'null');
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  localStorage.setItem('homeable_user', JSON.stringify(user));
}

async function apiRequest(endpoint, { method = 'GET', body = null, isFormData = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const config = {
    method,
    headers,
    credentials: 'include'
  };
  if (body) config.body = isFormData ? body : JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (err) {
    throw new Error('Network error — please check your connection and that the server is running.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = { success: false, message: 'Unexpected server response.' };
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, body, opts = {}) => apiRequest(endpoint, { method: 'POST', body, ...opts }),
  put: (endpoint, body, opts = {}) => apiRequest(endpoint, { method: 'PUT', body, ...opts }),
  delete: (endpoint, body) => apiRequest(endpoint, { method: 'DELETE', body })
};
