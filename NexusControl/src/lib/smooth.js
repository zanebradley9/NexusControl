// smooth.js - full monitoring system (clean backend version)

let initialized = false;

// --------------------
// LOG STORAGE (dashboard uses this)
// --------------------
const logs = [];

export function getSmoothLogs() {
  return logs;
}

function saveLog(log) {
  logs.push(log);
  if (logs.length > 150) logs.shift();
}

// --------------------
// BACKEND SENDER (NEW CLEAN SYSTEM)
// --------------------
function sendToBackend(payload) {
  if (typeof window === "undefined") return;

  fetch(`${import.meta.env.VITE_API_BASE_URL}/api/smooth/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

// --------------------
// LOG FORMAT
// --------------------
function createLog(type, data) {
  return {
    type,
    time: new Date().toISOString(),
    url: window.location.href,
    ...data,
  };
}

// --------------------
// SEVERITY SYSTEM (SMART ALERTS)
// --------------------
function getSeverity(type, data) {
  if (type === "JS ERROR") return "critical";
  if (type === "PROMISE ERROR") return "critical";

  if (type === "SLOW LOAD" && data.loadTime > 5000) return "high";
  if (type === "SLOW LOAD") return "medium";

  if (type === "LOW FPS") {
    if (data.fps < 15) return "high";
    return "low";
  }

  return "low";
}

// --------------------
// SMART REPORT SYSTEM (UPDATED)
// --------------------
function report(type, data, message) {
  const severity = getSeverity(type, data);

  const log = createLog(type, data);
  saveLog(log);

  // send EVERYTHING to backend (clean architecture)
  sendToBackend({
    type,
    data,
    message,
    severity,
  });

  return log;
}

// --------------------
// LOAD TIME
// --------------------
function getLoadTime() {
  const nav = performance.getEntriesByType("navigation")[0];
  if (!nav) return 0;
  return Math.round(nav.loadEventEnd - nav.startTime);
}

// --------------------
// FPS MONITOR
// --------------------
function startFPSMonitor() {
  let frames = 0;
  let last = performance.now();

  function loop() {
    frames++;
    const now = performance.now();

    if (now - last >= 5000) {
      const fps = Math.round((frames * 1000) / (now - last));

      if (fps < 15) {
        report("LOW FPS", { fps }, `Critical FPS drop: ${fps}`);
      } else if (fps < 30) {
        saveLog(createLog("LOW FPS", { fps }));
      }

      frames = 0;
      last = now;
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// --------------------
// INIT SYSTEM
// --------------------
export function initSmooth() {
  if (initialized) return;
  initialized = true;

  if (typeof window === "undefined") return;

  console.log("Smooth.js system started (backend mode)");

  // --------------------
  // JS ERRORS
  // --------------------
  window.addEventListener("error", (e) => {
    report(
      "JS ERROR",
      {
        message: e.message,
        file: e.filename,
        line: e.lineno,
      },
      e.message
    );
  });

  // --------------------
  // PROMISE ERRORS
  // --------------------
  window.addEventListener("unhandledrejection", (e) => {
    report(
      "PROMISE ERROR",
      {
        message: e.reason?.message || e.reason,
      },
      "Unhandled Promise Rejection"
    );
  });

  // --------------------
  // PAGE LOAD
  // --------------------
  window.addEventListener("load", () => {
    const loadTime = getLoadTime();

    if (loadTime > 7000) {
      report(
        "SLOW LOAD",
        { loadTime },
        `Critical slow load: ${loadTime}ms`
      );
    } else if (loadTime > 3000) {
      saveLog(createLog("SLOW LOAD", { loadTime }));
    }
  });

  // --------------------
  // FPS
  //--------------------
  startFPSMonitor();
}