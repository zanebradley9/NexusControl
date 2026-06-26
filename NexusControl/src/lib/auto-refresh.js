import { refreshToken } from "./refresh.js";

/**
 * Starts an auto-refresh loop that refreshes the token every 10 minutes.
 */
export function startAutoRefresh() {
  setInterval(() => {
    refreshToken();
  }, 1000 * 60 * 10); // every 10 minutes
}