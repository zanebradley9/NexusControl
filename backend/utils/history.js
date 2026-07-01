import mongoose from "mongoose";

/* =========================
   BASE SCHEMA (CLEAN)
========================= */

const baseHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    email: String,
    reason: String,

    metadata: {
      type: Object,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { strict: true }
);

/* =========================
   INDEXES (ONLY HERE)
========================= */

// fast lookup
baseHistorySchema.index({ userId: 1 });

// TTL auto delete
baseHistorySchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

/* =========================
   MODEL FACTORY
========================= */

function createModel(name, ttlSeconds) {
  const schema = baseHistorySchema.clone();

  schema.pre("save", function (next) {
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    }
    next();
  });

  return mongoose.model(name, schema);
}

/* =========================
   MODELS
========================= */

export const BlocklistHistory = createModel(
  "BlocklistHistory",
  60 * 60 * 24 * 365
);

export const SuspensionHistory = createModel(
  "SuspensionHistory",
  60 * 60 * 24 * 90
);

export const DeleteHistory11d = createModel(
  "DeleteHistory11d",
  60 * 60 * 24 * 11
);

export const DeleteHistory12d = createModel(
  "DeleteHistory12d",
  60 * 60 * 24 * 12
);

export const FullDeleteHistory10d = createModel(
  "FullDeleteHistory10d",
  60 * 60 * 24 * 10
);

export const SubscriptionHistory = createModel(
  "SubscriptionHistory",
  60 * 60 * 24 * 365
);

export const LoginHistory = createModel(
  "LoginHistory",
  60 * 60 * 24 * 30
);