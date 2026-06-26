import { hasPermission, PERMISSIONS } from "./roles.js";

/**
 * Hides UI elements based on the current user's role permissions.
 * Call this after loading user data.
 * @param {object} user - { role: string }
 */
export function protectUI(user) {
  // @ts-ignore
  const hide = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  };

  if (!hasPermission(user, PERMISSIONS.SEND_COMMANDS)) {
    hide("sendCommandBtn");
  }

  if (!hasPermission(user, PERMISSIONS.MANAGE_USERS)) {
    hide("userPanel");
  }

  if (!hasPermission(user, PERMISSIONS.VIEW_ANALYTICS)) {
    hide("analyticsPanel");
  }
}