import { getToken, logout } from './token.js';
import { refreshToken } from './refresh.js';
import { sendDiscordLog } from './discord.js';

/**
 * Central API request helper
 * - Injects auth token
 * - Handles 401 refresh retry once
 * - Logs failures safely
 * @param {string | URL | Request} url
 */
export async function apiRequest(url, options = {}) {
  if (!url) throw new Error('API URL is required');

  const makeRequest = (/** @type {string | null} */ token) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        // @ts-ignore
        ...(options.headers || {}),
      },
    });
  };

  try {
    const token = getToken?.();
    let res = await makeRequest(token);

    // TOKEN EXPIRED → TRY REFRESH
    if (res.status === 401) {
      console.warn('Token expired, attempting refresh...');

      try {
        await refreshToken?.();
      } catch (e) {
        console.error('Refresh failed:', e);
      }

      const newToken = getToken?.();
      res = await makeRequest(newToken);

      // STILL FAILED → LOGOUT
      if (res.status === 401) {
        logout?.();
        throw new Error('Unauthorized - logged out');
      }
    }

    // HANDLE NON-OK RESPONSES
    if (!res.ok) {
      const text = await res.text().catch(() => null);

      const error = new Error(
        `API Error ${res.status}${text ? `: ${text}` : ''}`
      );

      throw error;
    }

    // SAFE JSON PARSE
    try {
      return await res.json();
    } catch {
      return null;
    }
  } catch (err) {
    console.error('API FAIL:', err);

    try {
      // @ts-ignore
      sendDiscordLog?.(`❌ API Error: ${url} - ${err.message}`);
    } catch {}

    throw err;
  }
}