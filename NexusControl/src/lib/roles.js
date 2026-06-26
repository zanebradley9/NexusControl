// lib/roles.js

export const ROLES = {
  OWNER: "owner",
  OWNER_2: "owner_2",
  HEAD_ADMIN: "head_admin",
  ADMIN: "admin",
  MOD: "mod",
  USER: "user",
  SCRIPT: "script",
};

export const PERMISSIONS = {
  FULL_ACCESS: "full_access",
  VIEW_DASHBOARD: "view_dashboard",
  SEND_COMMANDS: "send_commands",
  VIEW_LOGS: "view_logs",
  MANAGE_USERS: "manage_users",
  VIEW_ANALYTICS: "view_analytics",
  USE_AUTOMATION: "use_automation",
};

export const ROLE_PERMISSIONS = {
  owner: Object.values(PERMISSIONS),
  owner_2: Object.values(PERMISSIONS),

  head_admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.SEND_COMMANDS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.USE_AUTOMATION,
  ],

  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.SEND_COMMANDS,
    PERMISSIONS.VIEW_LOGS,
  ],

  mod: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_LOGS,
  ],

  user: [
    PERMISSIONS.VIEW_DASHBOARD,
  ],

  script: [],
};

// @ts-ignore
export function hasPermission(user, permission) {
  if (!user || !permission) return false;

  const role = user.role;
  // @ts-ignore
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  const userPermissions = user.permissions || [];

  const allPermissions = new Set([
    ...rolePermissions,
    ...userPermissions,
  ]);

  return (
    allPermissions.has(PERMISSIONS.FULL_ACCESS) ||
    allPermissions.has(permission)
  );
}

// @ts-ignore
export function hasRole(user, role) {
  if (!user) return false;
  return user.role === role;
}