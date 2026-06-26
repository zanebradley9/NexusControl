export const CHANNEL_CONFIG = {
  public: {
    label: "General",
    discord: "💬-general-chat",
    access: ["user", "mod", "admin", "owner"],
  },

  business: {
    label: "Business",
    discord: "💼-business-chat",
    access: ["partnership", "admin", "owner"],
  },

  staff: {
    label: "Staff",
    discord: "👑-staff-chat",
    access: ["mod", "admin", "owner"],
  },

  owner: {
    label: "Owner",
    discord: "👑-owner-chat",
    access: ["owner"],
  },

  commands: {
    label: "Commands",
    discord: "⚙️-admin-commands",
    access: ["mod", "admin", "owner"],
  },
};

/* =========================
   ROLE HIERARCHY
========================= */

export const ROLE_LEVELS = {
  user: 1,
  partnership: 2,
  mod: 3,
  admin: 4,
  owner: 5,
};

/* =========================
   GET DEFAULT CHANNEL
========================= */

export function getChannel(user) {
  if (!user || !user.role) {
    return "public";
  }

  switch (user.role) {
    case "owner":
      return "owner";

    case "admin":
    case "mod":
      return "staff";

    case "partnership":
      return "business";

    default:
      return "public";
  }
}

/* =========================
   COMMAND PARSER
========================= */

export function parseCommand(text = "") {
  if (!text.trim().startsWith("!")) {
    return {
      isCommand: false,
      command: null,
      args: [],
    };
  }

  const parts = text
    .trim()
    .slice(1)
    .split(/\s+/);

  return {
    isCommand: true,
    command: parts[0]?.toLowerCase() || null,
    args: parts.slice(1),
  };
}

/* =========================
   COMMAND PERMISSIONS
========================= */

const COMMANDS = {
  shutdown: ["owner"],
  deleteall: ["owner"],
  owner: ["owner"],

  kick: ["admin", "owner"],
  ban: ["admin", "owner"],
  clear: ["mod", "admin", "owner"],
};

export function canRunCommand(command, role = "user") {
  const allowedRoles = COMMANDS[command];

  // command not restricted
  if (!allowedRoles) {
    return true;
  }

  return allowedRoles.includes(role);
}

/* =========================
   CHANNEL ACCESS CHECK
========================= */

export function canAccessChannel(channel, role = "user") {
  const config = CHANNEL_CONFIG[channel];

  if (!config) {
    return false;
  }

  return config.access.includes(role);
}