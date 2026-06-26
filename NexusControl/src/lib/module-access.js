import { MODULES } from "./modules.js";
import { hasPermission } from "./roles.js";

/**
 * Returns only the active modules the user has permission to access.
 * @param {{ role: string }} user
 * @returns {[string, object][]}
 */
export function getAvailableModules(user) {
  return Object.entries(MODULES).filter(([, mod]) => {
    if (mod.status !== "active") return false;
    return hasPermission(user, mod.permission);
  });
}