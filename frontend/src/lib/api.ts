const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type FetchOptions = RequestInit & { retry?: boolean };

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include", // IMPORTANT: sends refresh cookie
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.accessToken || null;
}

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const headers = new Headers(options.headers || {});
  
  // ⭐ CRITICAL FIX: Only set Content-Type for JSON requests
  // If body is FormData, let the browser set the Content-Type with boundary
  const isFormData = options.body instanceof FormData;
  
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // include cookies on every request (safe + consistent)
  });

  // If access token expired, try refresh once, then retry original request once
  if (res.status === 401 && !options.retry) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res; // refresh failed -> user should logout

    setAccessToken(newToken);

    const retryHeaders = new Headers(options.headers || {});
    
    // ⭐ Same fix for retry request
    const isRetryFormData = options.body instanceof FormData;
    if (!isRetryFormData && !retryHeaders.has("Content-Type")) {
      retryHeaders.set("Content-Type", "application/json");
    }
    
    retryHeaders.set("Authorization", `Bearer ${newToken}`);

    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: retryHeaders,
      credentials: "include",
      retry: true as any,
    });
  }

  return res;
}