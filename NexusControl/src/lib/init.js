/**
 * Initialize the full app system:
 * 1. Validate token with backend
 * 2. Lock UI based on user role
 * 3. Start scheduler, health monitor, and token auto-refresh
 */

import { getToken } from './token.js';
import { protectUI } from './ui-lock.js';
import { sendDiscordLog } from './discord.js';
import { startScheduler } from './scheduler.js';
import { startHealthMonitor } from './health.js';
import { startAutoRefresh } from './auto-refresh.js';

/* ---------------- INIT APP ---------------- */

export async function initApp() {
  try {
    const token = getToken();

    if (!token) {
      console.warn('[Init] No token found — skipping init');
      return;
    }

    let res;

    try {
      res = await fetch('/auth/validate', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });
    } catch (networkError) {
      throw new Error('Network error during auth validation');
    }

    if (!res.ok) {
      throw new Error(`Auth request failed (${res.status})`);
    }

    const data = await res.json();

    if (!data?.valid) {
      throw new Error('Invalid session');
    }

    const user = data.user;

    if (!user) {
      throw new Error('No user returned from server');
    }

    // Lock UI based on role permissions
    protectUI(user);

    console.log('[Init] App initialized as:', user.role || 'unknown');
  } catch (err) {
    // @ts-ignore
    console.error('[Init] Failed:', err?.message || err);

    // @ts-ignore
    sendDiscordLog('❌ Init failed: ' + (err?.message || err));
  }
}

/* ---------------- BOOT SYSTEM ---------------- */

export function bootSystem() {
  try {
    initApp();

    startScheduler?.();
    startHealthMonitor?.();
    startAutoRefresh?.();

    console.log('[Boot] System started');
  } catch (err) {
    console.error('[Boot] Failed:', err);

    // @ts-ignore
    sendDiscordLog('❌ Boot failed: ' + (err?.message || err));
  }
}