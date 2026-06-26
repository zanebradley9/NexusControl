import { sendDiscordLog } from "./discord.js";
import { logout } from "./token.js";

/**
 * ─────────────────────────────────────────────
 * GLOBAL SAFETY SYSTEM
 * ─────────────────────────────────────────────
 */

export function initSafetySystem() {
  // Catch JS runtime errors
  window.addEventListener("error", (event) => {
    console.error("[Safety] JS Error:", event.error);

    sendDiscordLog(
      "❌ JS Error: " + (event.message || "Unknown error"),
      "error"
    );
  });

  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("[Safety] Promise Error:", event.reason);

    sendDiscordLog(
      "❌ Promise Error: " +
        (event.reason?.message || event.reason || "Unknown"),
      "error"
    );
  });
}

/**
 * Safe async wrapper
 */
// @ts-ignore
export async function safeAsync(fn, fallback = null) {
  try {
    return await fn();
  } catch (err) {
    console.error("[Safety] safeAsync error:", err);

    // @ts-ignore
    sendDiscordLog("⚠️ SafeAsync Error: " + err.message, "error");
    return fallback;
  }
}

/**
 * Safe fetch (single clean version with retry support)
 */
// @ts-ignore
export async function safeFetch(url, options = {}, retries = 3) {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    return await res.json();
  } catch (err) {
    // @ts-ignore
    console.warn("[Safety] Fetch error:", err.message);

    if (retries > 0) {
      return safeFetch(url, options, retries - 1);
    }

    sendDiscordLog("❌ API Failed: " + url, "error");
    return null;
  }
}

/**
 * Safe execution wrapper (sync)
 */
// @ts-ignore
export function safeExecute(fn) {
  try {
    return fn();
  } catch (err) {
    console.error("[Safety] Execution error:", err);

    // @ts-ignore
    sendDiscordLog("❌ Execution Error: " + err.message, "error");
    return null;
  }
}

/**
 * Token safety check
 */
export function safeToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Session expired. Please login again.");
    logout();
    location.reload();
    return null;
  }

  return token;
}

/**
 * Safe command sender
 */
// @ts-ignore
export async function sendCommandSafe(data) {
  try {
    await safeFetch("/commands/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + safeToken(),
      },
      body: JSON.stringify(data),
    });
  } catch (err) {
    alert("Command failed. Try again.");
    console.error(err);
  }
}

/**
 * UI safety helper
 */
// @ts-ignore
export function safeUI(id, fallback = "Hidden") {
  const el = document.getElementById(id);

  if (!el) {
    console.warn("Missing UI:", id);
    return;
  }

  try {
    el.style.display = "block";
  } catch {
    el.innerText = fallback;
  }
}

/**
 * Auto recovery system
 */
export function autoRecover() {
  console.log("Attempting recovery...");
  setTimeout(() => location.reload(), 5000);
}

/**
 * Optional safe action wrapper
 */
// @ts-ignore
export function safeAction(fn) {
  try {
    fn();
  } catch (err) {
    console.error("[Safety] Action crash:", err);

    // @ts-ignore
    sendDiscordLog("❌ Action crash: " + err.message, "error");
  }
}

/**
 * Auto health check
 */
setInterval(async () => {
  try {
    await safeFetch("/status", {
      headers: {
        Authorization: "Bearer " + safeToken(),
      },
    });
  } catch {
    console.warn("Server offline");
    sendDiscordLog("⚠️ API server may be offline");
  }
}, 10000);