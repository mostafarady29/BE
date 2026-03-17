export const API_BASE = "/api";

export async function apiRequest(endpoint: string, options: any = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("mp_token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.message || `HTTP ${response.status}`;
    const err: any = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (url: string, opts?: any) => apiRequest(url, { method: "GET", ...opts }),
  post: (url: string, body: any) =>
    apiRequest(url, { method: "POST", body: JSON.stringify(body) }),
  patch: (url: string, body: any) =>
    apiRequest(url, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (url: string) => apiRequest(url, { method: "DELETE" }),
  put: (url: string, body: any) =>
    apiRequest(url, { method: "PUT", body: JSON.stringify(body) }),
};

export function statusBadge(status: string, label?: string) {
  const map: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Resolved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };
  const cls = map[status] || "bg-gray-100 text-gray-800";
  return `<span class="px-2 py-1 rounded text-xs font-semibold ${cls}">${label ? label : status}</span>`;
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
