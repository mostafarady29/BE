/* ─────────────────────────────────────────────────────────────────────────────
   api.js — Central fetch wrapper for MP System
   ───────────────────────────────────────────────────────────────────────────── */

const API_BASE = 'http://localhost:5000/api';

/**
 * Make an authenticated API request.
 * @param {string} endpoint  - Path after /api (e.g. '/posts')
 * @param {object} [options] - Fetch options override
 * @returns {Promise<object>} Parsed JSON
 */
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('mp_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        const message = data?.message || `HTTP ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        err.data = data;
        throw err;
    }

    return data;
}

/* ─── Convenience helpers ─────────────────────────────────────────────────── */
const api = {
    get: (url, opts) => apiRequest(url, { method: 'GET', ...opts }),
    post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
    patch: (url, body) => apiRequest(url, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (url) => apiRequest(url, { method: 'DELETE' }),
};

/* ─── Toast helper ────────────────────────────────────────────────────────── */
function showToast(message, type = 'success', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = '0.3s'; setTimeout(() => toast.remove(), 300); }, duration);
}

/* ─── Badge helper ────────────────────────────────────────────────────────── */
function statusBadge(status) {
    const map = {
        'Pending': 'badge-pending',
        'In Progress': 'badge-in-progress',
        'Resolved': 'badge-resolved',
        'Rejected': 'badge-rejected',
    };
    const cls = map[status] || 'badge-pending';
    return `<span class="badge ${cls}">${status}</span>`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}
