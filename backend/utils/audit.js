// backend/utils/audit.js

import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const AUDIT_FILE = path.join(LOG_DIR, "audit.log");

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Generic audit logger
 */
export function logAudit(action, user = "System", details = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        action,
        user,
        details,
    };

    fs.appendFileSync(
        AUDIT_FILE,
        JSON.stringify(entry) + "\n",
        "utf8"
    );

    console.log("[AUDIT]", entry);
}

/**
 * Alias (keeps older code working)
 */
export const audit = logAudit;

/**
 * Read all audit logs
 */
export function getAuditLogs() {
    if (!fs.existsSync(AUDIT_FILE)) return [];

    return fs
        .readFileSync(AUDIT_FILE, "utf8")
        .split("\n")
        .filter(Boolean)
        .map(line => JSON.parse(line));
}

/**
 * Clear audit log
 */
export function clearAuditLogs() {
    fs.writeFileSync(AUDIT_FILE, "");
}