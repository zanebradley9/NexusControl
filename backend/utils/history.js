const mongoose = require("mongoose");

/**
 * Base schema used for all history types
 * Includes TTL + timestamps
 */
const baseHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: false,
      index: true,
    },

    reason: {
      type: String,
      default: null,
    },

    metadata: {
      type: Object,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // TTL field (MongoDB auto deletes docs when this date is reached)
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { strict: true }
);

/**
 * TTL INDEX (MongoDB will auto delete expired documents)
 * Runs background cleanup automatically
 */
baseHistorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* -----------------------------
   Helper: create model factory
------------------------------ */
function createHistoryModel(name, ttlSeconds) {
  const schema = baseHistorySchema.clone();

  schema.pre("save", function (next) {
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    }
    next();
  });

  return mongoose.model(name, schema);
}

/* -----------------------------
   HISTORY MODELS
------------------------------ */

// 🚫 Blocklist (permanent-ish, but still TTL based)
const BlocklistHistory = createHistoryModel(
  "BlocklistHistory",
  60 * 60 * 24 * 365 // 1 year
);

// ⛔ Suspension history
const SuspensionHistory = createHistoryModel(
  "SuspensionHistory",
  60 * 60 * 24 * 90 // 90 days
);

// 🧹 11-day delete history
const DeleteHistory11d = createHistoryModel(
  "DeleteHistory11d",
  60 * 60 * 24 * 11
);

// 🧹 12-day delete history
const DeleteHistory12d = createHistoryModel(
  "DeleteHistory12d",
  60 * 60 * 24 * 12
);

// 💣 10-day full delete history
const FullDeleteHistory10d = createHistoryModel(
  "FullDeleteHistory10d",
  60 * 60 * 24 * 10
);

// 💳 Subscription history
const SubscriptionHistory = createHistoryModel(
  "SubscriptionHistory",
  60 * 60 * 24 * 365 // 1 year
);

// 🔐 Login history (keep short for security)
const LoginHistory = createHistoryModel(
  "LoginHistory",
  60 * 60 * 24 * 30 // 30 days
);

/* -----------------------------
   EXPORTS
------------------------------ */
module.exports = {
  BlocklistHistory,
  SuspensionHistory,
  DeleteHistory11d,
  DeleteHistory12d,
  FullDeleteHistory10d,
  SubscriptionHistory,
  LoginHistory,
};