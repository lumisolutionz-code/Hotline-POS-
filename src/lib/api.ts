// API utility with auto token refresh
// Use environment variable for production, fallback to domain URL
const API_URL = (import.meta.env.VITE_API_URL as string) || "https://api.hotlinecellular.lk/api/v1";
interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}
// Token refresh lock to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (data.status === "success" && data.data) {
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      return data.data.accessToken;
    }
  } catch (err) {
    console.error("Token refresh failed:", err);
  }
  // Refresh failed - clear tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  return null;
}
export async function api<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };
  if (!skipAuth) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
  } catch (err: any) {
    // Network error (offline)
    if (!navigator.onLine || err.message === "Failed to fetch") {
      // If it's a sale creation, queue it
      if (endpoint === "/sales" && fetchOptions.method === "POST" && fetchOptions.body) {
        const saleData = JSON.parse(fetchOptions.body as string);
        saleData._offlineId = Date.now().toString(); // unique local ID
        saleData.createdAt = new Date().toISOString();

        const queue = JSON.parse(localStorage.getItem("offlineSalesQueue") || "[]");
        queue.push(saleData);
        localStorage.setItem("offlineSalesQueue", JSON.stringify(queue));

        // Return a mock successful response so the UI proceeds
        return {
          status: "success",
          data: { sale: saleData },
          message: "Saved offline. Will sync when online."
        } as any;
      }
      throw new Error("You are offline. This action cannot be completed offline.");
    }
    throw err;
  }

  // Handle 401 - attempt token refresh
  if (res.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      if (newToken) {
        onTokenRefreshed(newToken);
        // Retry original request
        (headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(`${API_URL}${endpoint}`, {
          ...fetchOptions,
          headers,
        });
      } else {
        // Redirect to login
        window.location.hash = "#/login";
        throw new Error("Session expired");
      }
    } else {
      // Wait for refresh to complete
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (token) => {
          (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
          try {
            const retryRes = await fetch(`${API_URL}${endpoint}`, {
              ...fetchOptions,
              headers,
            });
            resolve(await retryRes.json());
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }
  return res.json();
}

// Background sync logic
let isSyncing = false;
export async function syncOfflineData() {
  if (isSyncing || !navigator.onLine) return;

  const queue = JSON.parse(localStorage.getItem("offlineSalesQueue") || "[]");
  if (queue.length === 0) return;

  isSyncing = true;
  try {
    const res = await apiPost<any>("/sales/sync", { sales: queue });
    if (res.status === "success") {
      // Clear queue if sync successful
      localStorage.setItem("offlineSalesQueue", "[]");
      // Could dispatch event to notify UI of successful sync
      window.dispatchEvent(new CustomEvent('offline-sync-complete', {
        detail: { count: queue.length }
      }));
    }
  } catch (err) {
    console.error("Offline sync failed:", err);
  } finally {
    isSyncing = false;
  }
}

// Auto-sync when coming online
window.addEventListener("online", () => {
  setTimeout(syncOfflineData, 1000);
});

// Periodic sync check (every 30 seconds) just in case
setInterval(syncOfflineData, 30000);

// Convenience methods
export const apiGet = <T>(endpoint: string) => api<T>(endpoint, { method: "GET" });
export const apiPost = <T>(endpoint: string, body: unknown) =>
  api<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const apiPut = <T>(endpoint: string, body: unknown) =>
  api<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const apiDelete = <T>(endpoint: string) =>
  api<T>(endpoint, { method: "DELETE" });