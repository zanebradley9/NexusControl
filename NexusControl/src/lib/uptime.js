// @ts-ignore
let uptimeLogs = [];

/**
 * ─────────────────────────────────────────────
 * UPTIME LOGGER
 * ─────────────────────────────────────────────
 */

/**
 * Log uptime status (online/offline)
 */
// @ts-ignore
export function logUptime(status) {
  uptimeLogs.push({
    time: new Date().toISOString(),
    status,
  });

  // Keep only last 100 logs
  if (uptimeLogs.length > 100) {
    // @ts-ignore
    uptimeLogs.shift();
  }
}

/**
 * Get uptime history
 */
export function getUptime() {
  // @ts-ignore
  return uptimeLogs;
}

/**
 * Start uptime monitoring loop
 */
export function startUptimeMonitor() {
  setInterval(async () => {
    try {
      const res = await fetch("/status");

      if (!res.ok) {
        throw new Error("Bad response");
      }

      logUptime("online");
    } catch (err) {
      logUptime("offline");
    }
  }, 10000);
}