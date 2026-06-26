import { apiRequest } from "./api.js";
import { sendDiscordLog } from "./discord.js";

let fails = 0;

/**
 * Start the health monitor. Checks /status every 10s.
 * After 3 consecutive failures, alerts Discord and reloads.
 */
export function startHealthMonitor() {
  setInterval(async () => {
    try {
      await apiRequest("/status");
      fails = 0;
    } catch {
      fails++;
      if (fails >= 3) {
        sendDiscordLog("🚨 System unstable");
        location.reload();
      }
    }
  }, 10000);
}