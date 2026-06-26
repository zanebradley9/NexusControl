import { ROLE_PERMISSIONS } from './roles.js';

// @ts-ignore
const ACCESS_SECRET =
  // @ts-ignore
  import.meta.env?.VITE_ACCESS_SECRET || 'change_this_now';

/* ---------------- SAFE BASE64 ---------------- */

// @ts-ignore
function safeAtob(value) {
  try {
    return atob(value);
  } catch {
    return null;
  }
}

/* ---------------- TOKEN EXTRACT ---------------- */

// @ts-ignore
function getTokenFromHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

/* ---------------- VALIDATE REQUEST ---------------- */

// @ts-ignore
export function validateRequest(req, requiredFields = []) {
  const errors = [];

  if (!req || typeof req !== 'object') return ['Invalid request'];

  const body = req.body || {};

  for (const field of requiredFields) {
    const value = body[field];

    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      errors.push(`${field} is required`);
    }
  }

  return errors;
}

/* ---------------- DECODE TOKEN ---------------- */

// @ts-ignore
export function decodeToken(token) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    const payload = safeAtob(parts[1]);
    if (!payload) return null;

    const data = JSON.parse(payload);

    const now = Math.floor(Date.now() / 1000);

    if (data?.exp && data.exp < now) return null;

    return data;
  } catch {
    return null;
  }
}

/* ---------------- AUTHORIZE USER ---------------- */

// @ts-ignore
export function authorize(req, requiredPermission) {
  try {
    if (!req) return { error: 'Invalid request' };

    const authHeader = req.headers?.authorization;
    if (!authHeader) return { error: 'No token provided' };

    const token = getTokenFromHeader(authHeader);
    if (!token) return { error: 'Invalid token format' };

    const user = decodeToken(token);
    if (!user) return { error: 'Invalid or expired token' };

    const permissions =
      user.permissions?.length > 0
        ? user.permissions
        // @ts-ignore
        : ROLE_PERMISSIONS?.[user.role] || [];

    const hasAccess =
      permissions.includes('full_access') ||
      permissions.includes(requiredPermission);

    if (!hasAccess) return { error: 'Forbidden' };

    return { user };
  } catch {
    return { error: 'Authorization failed' };
  }
}

/* ---------------- OWNER COMMANDS ---------------- */

export const OWNER_ONLY_COMMANDS = [
  'shutdown',
  'wipe',
  'factory_reset',
];

// @ts-ignore
export function guardOwnerCommand(command, user) {
  try {
    if (!command || !user) return { error: 'Missing data' };

    if (
      OWNER_ONLY_COMMANDS.includes(command) &&
      user.role !== 'owner'
    ) {
      return { error: 'Owner only command' };
    }

    return { ok: true };
  } catch {
    return { error: 'Command guard failed' };
  }
}

/* ---------------- AI AUTH ---------------- */

// @ts-ignore
export function authorizeAI(req) {
  try {
    if (!req) return { error: 'Invalid request' };

    const key = req.headers?.['x-ai-key'];
    // @ts-ignore
    const expected = import.meta.env?.VITE_AI_SECRET;

    if (!expected) return { error: 'AI secret missing' };

    if (key !== expected) return { error: 'Unauthorized AI' };

    return { ok: true };
  } catch {
    return { error: 'AI auth failed' };
  }
}