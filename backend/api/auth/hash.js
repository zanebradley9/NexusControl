 import bcrypt from "bcryptjs";
import crypto from "crypto";

/* =========================================
   CONFIG
========================================= */

export const PASSWORD_POLICY = {
  minLength: 10,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

const SALT_ROUNDS =
  Number(process.env.BCRYPT_ROUNDS) || 12;

/* =========================================
   HASH PASSWORD
========================================= */

export async function hashPassword(password) {
  const validation =
    validatePassword(password);

  if (!validation.valid) {
    throw new Error(
      validation.errors.join(", ")
    );
  }

  const salt =
    await bcrypt.genSalt(SALT_ROUNDS);

  return bcrypt.hash(password, salt);
}

/* =========================================
   COMPARE PASSWORD
========================================= */

export async function comparePassword(
  password,
  hash
) {
  try {
    if (!password || !hash) {
      return false;
    }

    return await bcrypt.compare(
      password,
      hash
    );
  } catch {
    return false;
  }
}

/* =========================================
   VALIDATE PASSWORD
========================================= */

export function validatePassword(
  password
) {
  const errors = [];

  if (!password) {
    errors.push("Password required");
  }

  if (
    password?.length <
    PASSWORD_POLICY.minLength
  ) {
    errors.push(
      `Minimum ${PASSWORD_POLICY.minLength} characters`
    );
  }

  if (
    password?.length >
    PASSWORD_POLICY.maxLength
  ) {
    errors.push(
      `Maximum ${PASSWORD_POLICY.maxLength} characters`
    );
  }

  if (
    PASSWORD_POLICY.requireUppercase &&
    !/[A-Z]/.test(password)
  ) {
    errors.push(
      "Must contain uppercase letter"
    );
  }

  if (
    PASSWORD_POLICY.requireLowercase &&
    !/[a-z]/.test(password)
  ) {
    errors.push(
      "Must contain lowercase letter"
    );
  }

  if (
    PASSWORD_POLICY.requireNumber &&
    !/[0-9]/.test(password)
  ) {
    errors.push(
      "Must contain number"
    );
  }

  if (
    PASSWORD_POLICY.requireSpecial &&
    !/[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(
      password
    )
  ) {
    errors.push(
      "Must contain special character"
    );
  }

  const score =
    calculatePasswordStrength(
      password
    );

  return {
    valid: errors.length === 0,
    score,
    strength:
      score >= 90
        ? "very-strong"
        : score >= 75
        ? "strong"
        : score >= 50
        ? "medium"
        : "weak",
    errors,
  };
}

/* =========================================
   PASSWORD STRENGTH
========================================= */

export function calculatePasswordStrength(
  password = ""
) {
  let score = 0;

  score += Math.min(
    password.length * 4,
    40
  );

  if (/[A-Z]/.test(password))
    score += 15;

  if (/[a-z]/.test(password))
    score += 15;

  if (/[0-9]/.test(password))
    score += 15;

  if (
    /[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]/.test(
      password
    )
  )
    score += 15;

  if (password.length >= 16)
    score += 10;

  return Math.min(score, 100);
}

/* =========================================
   PASSWORD GENERATOR
========================================= */

export function generatePassword(
  length = 16
) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  let result = "";

  const bytes =
    crypto.randomBytes(length);

  for (
    let i = 0;
    i < length;
    i++
  ) {
    result +=
      chars[
        bytes[i] % chars.length
      ];
  }

  return result;
}

/* =========================================
   CHECK COMMON PASSWORD
========================================= */

export function isCommonPassword(
  password
) {
  const common = [
    "password",
    "123456",
    "12345678",
    "qwerty",
    "admin",
    "letmein",
    "welcome",
  ];

  return common.includes(
    password.toLowerCase()
  );
}

/* =========================================
   HASH DETECTION
========================================= */

export function isBcryptHash(
  value
) {
  return /^\$2[aby]\$\d+\$/.test(
    value
  );
}

/* =========================================
   NEEDS REHASH
========================================= */

export function needsRehash(
  hash
) {
  try {
    const rounds = parseInt(
      hash.split("$")[2]
    );

    return rounds < SALT_ROUNDS;
  } catch {
    return true;
  }
}

/* =========================================
   PASSWORD EXPIRATION
========================================= */

export function passwordExpired(
  passwordChangedAt,
  days = 180
) {
  if (!passwordChangedAt)
    return true;

  const expiry =
    new Date(passwordChangedAt);

  expiry.setDate(
    expiry.getDate() + days
  );

  return Date.now() > expiry;
}

/* =========================================
   REMOVE SENSITIVE DATA
========================================= */

export function sanitizeUser(
  user
) {
  if (!user) return null;

  const obj =
    typeof user.toObject ===
    "function"
      ? user.toObject()
      : { ...user };

  delete obj.password;
  delete obj.passwordHistory;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;

  return obj;
}