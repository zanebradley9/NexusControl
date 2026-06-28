// backend/scheduler/index.js

let scheduler = null;

async function runTasks() {
  try {
    console.log("[SCHEDULER] Running scheduled tasks...");

    // ======================================
    // Add your recurring jobs here
    // ======================================

    // Example:
    // await cleanupExpiredSessions();
    // await updateDiscordStats();
    // await checkSubscriptions();
    // await scanLogs();

    console.log("[SCHEDULER] Tasks completed.");
  } catch (err) {
    console.error("[SCHEDULER] Error:", err);
  }
}

export function startScheduler() {
  if (scheduler) {
    console.log("[SCHEDULER] Already running.");
    return scheduler;
  }

  console.log("[SCHEDULER] Started.");

  // Run immediately
  runTasks();

  // Run every minute
  scheduler = setInterval(runTasks, 60 * 1000);

  return scheduler;
}

export function stopScheduler() {
  if (scheduler) {
    clearInterval(scheduler);
    scheduler = null;
    console.log("[SCHEDULER] Stopped.");
  }
}