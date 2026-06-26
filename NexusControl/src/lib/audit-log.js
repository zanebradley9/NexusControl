const STORAGE_KEY = "nexus_audit_log";
const MAX_ENTRIES = 200;

/**
 * Append an audit log entry to localStorage.
 * @param {"module_status"|"security"|"system"|"command"} type
 * @param {string} message
 * @param {object} [meta]
 */
export function logAudit(type, message, meta = {}) {
  const entry = {
    id: Date.now() + Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
    type,
    message,
    meta,
  };

  const existing = getAuditLogs();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("auditLogUpdated"));
}

export function getAuditLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearAuditLogs() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("auditLogUpdated"));
}