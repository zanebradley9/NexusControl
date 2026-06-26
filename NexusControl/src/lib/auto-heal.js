import { sendDiscordLog } from "./discord.js";

let failureCount = 0;

// ─── Monitor System Health ────────────────────────────────────────────────────

export async function monitorSystem() {
  try {
    await fetch("/status");
    failureCount = 0;
  } catch {
    failureCount++;
    console.warn("Failure count:", failureCount);
    if (failureCount >= 3) triggerRecovery();
  }
}

// ─── Recovery Actions ─────────────────────────────────────────────────────────

function triggerRecovery() {
  console.log("⚠️ Auto-healing triggered");
  sendDiscordLog("🚨 System failure detected. Attempting recovery...");
  restartConnection();
  reloadApp();
}

function restartConnection() {
  console.log("Restarting API connection...");
}

function reloadApp() {
  setTimeout(() => location.reload(), 5000);
}

// ─── Start Monitor Loop ───────────────────────────────────────────────────────

export function startAutoHeal() {
  setInterval(monitorSystem, 5000);
}