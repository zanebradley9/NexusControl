/**
 * Module configuration storage system
 * Uses localStorage with safe parsing + update events
 */

const STORAGE_KEY = 'nexus_module_configs';

/* ---------------- GET CONFIG ---------------- */

// @ts-ignore
export function getModuleConfig(key) {
  try {
    if (typeof window === 'undefined') return {};

    const raw = localStorage.getItem(STORAGE_KEY);

    const all = raw ? JSON.parse(raw) : {};

    if (!key) return all;

    return all[key] || {};
  } catch (err) {
    console.warn('[ModuleConfig] Get failed:', err);
    return {};
  }
}

/* ---------------- SAVE CONFIG ---------------- */

// @ts-ignore
export function saveModuleConfig(key, config) {
  try {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY);

    const all = raw ? JSON.parse(raw) : {};

    all[key] = config;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    window.dispatchEvent(
      new CustomEvent('moduleConfigUpdated', {
        detail: { key, config },
      })
    );
  } catch (err) {
    console.warn('[ModuleConfig] Save failed:', err);
  }
}

/* ---------------- CLEAR SINGLE MODULE ---------------- */

// @ts-ignore
export function clearModuleConfig(key) {
  try {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY);

    const all = raw ? JSON.parse(raw) : {};

    delete all[key];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

    window.dispatchEvent(
      new CustomEvent('moduleConfigUpdated', {
        detail: { key },
      })
    );
  } catch (err) {
    console.warn('[ModuleConfig] Clear failed:', err);
  }
}

/* ---------------- CLEAR ALL ---------------- */

export function clearAllModuleConfigs() {
  try {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(
      new CustomEvent('moduleConfigUpdated', {
        detail: { all: true },
      })
    );
  } catch (err) {
    console.warn('[ModuleConfig] Clear all failed:', err);
  }
}