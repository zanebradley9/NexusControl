import { sendDiscordLog } from './discord.js';

const CPU_THRESHOLD = 90;
const POLL_INTERVAL = 5000;

/**
 * Analyze a system status snapshot
 * @param {{
 *   cpu?: number,
 *   status?: string,
 *   client?: string
 * }} data
 */
export function analyze(data = {}) {
  try {
    const cpu = Number(data.cpu || 0);
    const status = data.status || 'unknown';
    const client = data.client || 'unknown';

    /* ---------------- HIGH CPU ---------------- */

    if (cpu >= CPU_THRESHOLD) {
      sendDiscordLog(
        `🔥 High CPU detected on ${client}: ${cpu}%`,
        'error'
      );

      sendAutoCommand(client, 'restart');
    }

    /* ---------------- OFFLINE ---------------- */

    if (status === 'offline') {
      sendDiscordLog(
        `⚠️ System offline: ${client}`,
        'error'
      );
    }
  } catch (err) {
    console.error('[AI] Analyze failed:', err);
  }
}

/**
 * Send internal AI command
 * @param {string} target
 * @param {string} command
 */
async function sendAutoCommand(target = 'pc-001', command = 'restart') {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    const aiKey = /** @type {any} */ (import.meta).env?.VITE_AI_SECRET || '';

    const response = await fetch('/api/internal/ai-command', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'x-ai-key': aiKey,
      },

      body: JSON.stringify({
        target,
        command,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    console.warn('[AI] Failed to send auto-command:', err);
  }
}

/**
 * Start AI monitoring loop
 * Polls /api/status every few seconds
 *
 * @returns {() => void} cleanup function
 */
export function startAIMonitor() {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const intervalId = window.setInterval(async () => {
    try {
      const response = await fetch('/api/status');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (
        data &&
        Array.isArray(data.clients) &&
        data.clients.length > 0
      ) {
        analyze(data.clients[0]);
      }
    } catch (err) {
      console.warn('[AI] Status poll failed:', err);
    }
  }, POLL_INTERVAL);

  return () => {
    window.clearInterval(intervalId);
  };
}