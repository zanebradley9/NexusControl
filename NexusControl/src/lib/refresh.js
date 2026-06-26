import { getToken, setToken, logout } from "./token.js";

let isRefreshing = false;

/**
 * Attempt to refresh the session token via /api/auth/refresh.
 * Logs out automatically if refresh fails.
 */
export async function refreshToken() {
  if (isRefreshing) return;
  isRefreshing = true;

  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: getToken() })
    });

    const data = await res.json();
    if (!data.success) throw new Error("Refresh failed");

    setToken(data.token);
    console.log("🔄 Token refreshed");
  } catch (err) {
    console.warn("Refresh failed, logging out");
    logout();
  }

  isRefreshing = false;
}