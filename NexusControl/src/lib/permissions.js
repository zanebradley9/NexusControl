// src/lib/permissions.js

import { ROLE_PERMISSIONS } from "./roles.js";

/**
 * Permission list (central reference)
 */
export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  SEND_COMMANDS: "send_commands",
  VIEW_LOGS: "view_logs",
  MANAGE_USERS: "manage_users",
  VIEW_ANALYTICS: "view_analytics",
  USE_AUTOMATION: "use_automation",
  FULL_ACCESS: "full_access",
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user, permission) {
  if (!user) return false;

  const userPermissions =
    user.permissions ||
    ROLE_PERMISSIONS?.[user.role] ||
    [];

  if (userPermissions.includes(PERMISSIONS.FULL_ACCESS)) return true;

  return userPermissions.includes(permission);
}

/**
 * Convert Discord roles → app role
 */
export function mapDiscordRoles(discordRoles = []) {
  if (!Array.isArray(discordRoles)) return "user";

  if (discordRoles.includes("owner")) return "owner";
  if (discordRoles.includes("admin")) return "admin";
  if (discordRoles.includes("moderator")) return "admin";

  return "user";
}

/**
 * Attach Discord roles to user
 */
export function attachDiscordRoles(user, discordRoles = []) {
  return {
    ...user,
    role: mapDiscordRoles(discordRoles),
    discordRoles,
  };
}

/**
 * Check module access
 */
export function canAccessModule(user, modulePermission) {
  return hasPermission(user, modulePermission);
}

/**
 * Save permissions (for your UI page)
 */
export function savePermissions(data) {
  localStorage.setItem("permissions", JSON.stringify(data));
}

/**
 * Load permissions (for your UI page)
 */
export function loadPermissions() {
  const data = localStorage.getItem("permissions");
  return data ? JSON.parse(data) : [];
}