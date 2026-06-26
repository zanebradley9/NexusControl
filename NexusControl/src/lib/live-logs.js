import { pushNotification } from "./notifications.js";

const WS_URL = "wss://your-domain/ws"; // change to your production WS URL

/**
 * Start WebSocket live log subscription.
 * Auto-reconnects on disconnect.
 * @param {(log: object) => void} onLog - callback fired on each new log
 */
export function startLiveLogs(onLog) {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "log") {
        onLog(msg.data);
        if (msg.data.type === "error") {
          pushNotification("⚠️ Error", msg.data.message);
        }
      }
    } catch (err) {
      console.warn("Live log parse error:", err);
    }
  };

  ws.onclose = () => {
    console.warn("Live logs disconnected. Reconnecting in 3s...");
    setTimeout(() => startLiveLogs(onLog), 3000);
  };

  ws.onerror = (err) => {
    console.warn("Live logs WS error:", err);
  };

  return ws;
}