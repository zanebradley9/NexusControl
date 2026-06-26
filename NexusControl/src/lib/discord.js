/**
 * Discord webhook logging utility
 * Used for API, Security, and Client event logging
 */

/* ---------------- WEBHOOKS ---------------- */

const API_WEBHOOK =
  "https://discord.com/api/webhooks/1496337769234960627/YEY2SPFC3tCToJO-9Tz1UHOqz8GDHa_7xgEVB6eILZ-t5zC6LDqok2uMQbJlxt8eKX9h";

const SECURITY_WEBHOOK =
  "https://discord.com/api/webhooks/1496337920695603303/CyRJ5SH9DkhPSxnnqn3xq2utOzTX-nBvsiXi75SkpAj5q17Rv-dQskynmpeaDI6czc1g";

const CLIENT_WEBHOOK =
  "https://discord.com/api/webhooks/1496334155510972517/wJS3zcx5yRuVbxv3P7BX8ADOOX7rBJzfvi_ClPsg2HvQw6PiF2JFE2uD56YGs41kItXl";

/* ---------------- CORE SENDER ---------------- */

// @ts-ignore
async function send(webhook, message, title, color = 3447003) {
  if (!webhook || typeof webhook !== 'string') return;

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'NexusControl',
        embeds: [
          {
            title: title || 'Log',
            description:
              typeof message === 'string'
                ? message
                : JSON.stringify(message, null, 2),
            color,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    // @ts-ignore
    console.warn('[Discord] Failed to send log:', err?.message || err);
  }
}

/* ---------------- LOG TYPES ---------------- */

/** API logs */
// @ts-ignore
export function logAPI(msg) {
  return send(API_WEBHOOK, msg, '📡 API', 3447003);
}

/** Security logs */
// @ts-ignore
export function logSecurity(msg) {
  return send(SECURITY_WEBHOOK, msg, '🔒 Security', 16776960);
}

/** Client logs */
// @ts-ignore
export function logClient(msg) {
  return send(CLIENT_WEBHOOK, msg, '💻 Client', 5763719);
}

/* ---------------- LEGACY LOGGER ---------------- */

/**
 * Generic logger used across older modules
 */
// @ts-ignore
export function sendDiscordLog(message, type = 'info') {
  const isError = type === 'error';

  return send(
    API_WEBHOOK,
    message,
    isError ? '⚠️ Error' : '📢 Event',
    isError ? 16711680 : 3447003
  );
}