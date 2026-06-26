/**
 * Module registry system
 * Handles permissions, module state, and persistence
 */

import { PERMISSIONS } from './roles.js';
import { logAudit } from './audit-log.js';

/* ---------------- MODULE DEFINITIONS ---------------- */

export const MODULES = {
  dashboard: {
    name: 'Dashboard',
    version: '1.0.0',
    status: 'active',
    desc: 'System overview and live monitoring',
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },

  scripts: {
    name: 'Script Control',
    version: '1.0.0',
    status: 'active',
    desc: 'Register and manage scripts + command sending',
    permission: PERMISSIONS.SEND_COMMANDS,
  },

  logs: {
    name: 'Activity Logs',
    version: '1.0.0',
    status: 'active',
    desc: 'Centralized log system with export',
    permission: PERMISSIONS.VIEW_LOGS,
  },

  notifications: {
    name: 'Notifications',
    version: '1.0.0',
    status: 'active',
    desc: 'Visual popup alerts for errors & updates',
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },

  permissions: {
    name: 'Permissions',
    status: 'active',
    desc: 'User roles and access control',
    permission: PERMISSIONS.MANAGE_USERS,
  },

  analytics: {
    name: 'Analytics',
    status: 'active',
    desc: 'Performance charts and script analytics',
    permission: PERMISSIONS.VIEW_ANALYTICS,
  },

  automation: {
    name: 'Automation',
    status: 'active',
    desc: 'Scheduled commands and event triggers',
    permission: PERMISSIONS.USE_AUTOMATION,
  },

  groups: {
    name: 'Script Groups',
    status: 'active',
    desc: 'Organize scripts into logical groups',
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },

  api: {
    name: 'API Gateway',
    status: 'active',
    desc: 'External webhook and API integration layer',
    permission: PERMISSIONS.FULL_ACCESS,
  },
};

/* ---------------- SAFE STORAGE LOAD ---------------- */

const STORAGE_KEY = 'nexus_modules';

function safeLoadModules() {
  try {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);

    Object.entries(parsed).forEach(([key, mod]) => {
      // @ts-ignore
      if (MODULES[key] && mod?.status) {
        // @ts-ignore
        MODULES[key].status = mod.status;
      }
    });
  } catch (err) {
    console.warn('[Modules] Failed to restore state:', err);
  }
}

safeLoadModules();

/* ---------------- UPDATE MODULE STATUS ---------------- */

/**
 * Dynamically update a module's status at runtime
 * Persists changes + logs audit event + notifies UI
 */
// @ts-ignore
export function updateModuleStatus(key, status) {
  try {
    // @ts-ignore
    if (!MODULES[key]) return;

    // @ts-ignore
    const previous = MODULES[key].status;

    // @ts-ignore
    MODULES[key].status = status;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MODULES));

      window.dispatchEvent(
        new Event('modulesUpdated')
      );
    }

    logAudit(
      'module_status',
      `Module "${key}" changed: ${previous} → ${status}`,
      {
        module: key,
        from: previous,
        to: status,
      }
    );
  } catch (err) {
    console.warn('[Modules] Update failed:', err);
  }
}