export const AUTH_KEY = "mp_token";
export const USER_KEY = "mp_user";

export const auth = {
    getToken() {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(AUTH_KEY);
    },
    getUser() {
        if (typeof window === "undefined") return null;
        try {
            return JSON.parse(localStorage.getItem(USER_KEY) || "null");
        } catch {
            return null;
        }
    },
    isLoggedIn() {
        return !!this.getToken();
    },
    isAdmin() {
        return this.getUser()?.role === "admin";
    },

    save(token: string, user: any) {
        if (typeof window === "undefined") return;
        localStorage.setItem(AUTH_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clear() {
        if (typeof window === "undefined") return;
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
    },

    logout() {
        this.clear();
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    },

    guard(requiredRole?: "admin" | "moderator") {
        if (typeof window === "undefined") return true;
        if (!this.isLoggedIn()) {
            window.location.href = `/login?redirect=${encodeURIComponent(
                window.location.pathname
            )}`;
            return false;
        }
        if (requiredRole && this.getUser()?.role !== requiredRole) {
            window.location.href = "/dashboard";
            return false;
        }
        return true;
    },

    redirectIfLoggedIn() {
        if (typeof window === "undefined") return;
        if (this.isLoggedIn()) {
            window.location.href = "/dashboard";
        }
    },
};
