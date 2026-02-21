/* ─────────────────────────────────────────────────────────────────────────────
   auth.js — Token management & route guards
   ───────────────────────────────────────────────────────────────────────────── */

const AUTH_KEY = 'mp_token';
const USER_KEY = 'mp_user';

const auth = {
    getToken() { return localStorage.getItem(AUTH_KEY); },
    getUser() {
        try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
        catch { return null; }
    },
    isLoggedIn() { return !!this.getToken(); },
    isAdmin() { return this.getUser()?.role === 'admin'; },

    save(token, user) {
        localStorage.setItem(AUTH_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clear() {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
    },

    logout() {
        this.clear();
        window.location.href = '/login.html';
    },

    /**
     * Protect a route: redirect to login if not authenticated.
     * Optionally restrict to a specific role.
     * @param {'admin'|'moderator'} [requiredRole]
     */
    guard(requiredRole) {
        if (!this.isLoggedIn()) {
            window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
            return false;
        }
        if (requiredRole && this.getUser()?.role !== requiredRole) {
            window.location.href = '/dashboard.html';
            return false;
        }
        return true;
    },

    /**
     * Redirect already logged-in users away from login page.
     */
    redirectIfLoggedIn() {
        if (this.isLoggedIn()) window.location.href = '/dashboard.html';
    },

    /**
     * Render the user info in the sidebar/navbar.
     */
    renderUserInfo() {
        const user = this.getUser();
        const el = document.getElementById('user-info');
        if (!el || !user) return;
        el.innerHTML = `
      <div style="font-weight:600;font-size:.875rem">${user.username}</div>
      <div style="font-size:.75rem;color:var(--text-muted);text-transform:capitalize">${user.role}</div>
    `;
    },
};
