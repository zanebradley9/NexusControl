import mongoose from "mongoose";

const { Schema } = mongoose;

/* =========================
   SUB SCHEMAS
========================= */

const apiKeySchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    key: { type: String, required: true, select: false },
    createdAt: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: null },
  },
  { _id: false }
);

const aiUsageSchema = new Schema(
  {
    requests: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 },
    modelsUsed: [{ type: String }],
    lastRequest: { type: Date, default: null },
  },
  { _id: false }
);

const subscriptionSchema = new Schema(
  {
    plan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled", "expired"],
      default: "inactive",
    },
    expiresAt: { type: Date, default: null, index: true },
    renewAt: { type: Date, default: null },
  },
  { _id: false }
);

const settingsSchema = new Schema(
  {
    theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    notifications: { type: Boolean, default: true },
    sounds: { type: Boolean, default: true },
    language: { type: String, default: "en" },
  },
  { _id: false }
);

const loginHistorySchema = new Schema(
  {
    ip: String,
    userAgent: String,
    success: Boolean,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* =========================
   MAIN USER SCHEMA
========================= */

const userSchema = new Schema(
  {
    /* AUTH */
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    /* PROFILE */
    avatar: String,
    banner: String,
    bio: { type: String, maxlength: 500, default: "" },

    /* ROLES */
    role: {
      type: String,
      enum: ["user", "moderator", "admin", "owner"],
      default: "user",
      index: true,
    },

    permissions: [{ type: String }],

    /* STATUS */
    active: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },

    banned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },
    banExpires: { type: Date, default: null },

    /* SECURITY */
    loginCount: { type: Number, default: 0 },
    lastLogin: Date,
    lastIp: String,

    failedLogins: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    passwordChangedAt: Date,

    refreshToken: { type: String, select: false },

    /* PASSWORD RESET */
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: Date,

    /* EMAIL VERIFICATION */
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: Date,

    /* 2FA */
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },

    /* DISCORD */
    discordId: { type: String, index: true },
    discordUsername: String,

    /* AI USAGE */
    aiUsage: aiUsageSchema,

    /* BILLING */
    stripeCustomerId: { type: String, index: true },
    subscription: subscriptionSchema,

    /* RELATIONS */
    saveProfile: {
      type: Schema.Types.ObjectId,
      ref: "Save",
    },

    /* SETTINGS */
    settings: settingsSchema,

    /* API KEYS */
    apiKeys: [apiKeySchema],

    /* LOGIN HISTORY (NEW) */
    loginHistory: [loginHistorySchema],

    /* DEVICE TRACKING (NEW) */
    devices: [
      {
        deviceId: String,
        userAgent: String,
        lastActive: Date,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================
   INDEXES (OPTIMIZED)
========================= */

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, banned: 1 });
userSchema.index({ discordId: 1 });
userSchema.index({ stripeCustomerId: 1 });

/* =========================
   VIRTUALS
========================= */

userSchema.virtual("isPremium").get(function () {
  return this.subscription?.plan && this.subscription.plan !== "free";
});

userSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

/* =========================
   MIDDLEWARE HELPERS
========================= */

userSchema.methods.incrementLogin = function (ip) {
  this.loginCount += 1;
  this.lastLogin = new Date();
  this.lastIp = ip;
};

userSchema.methods.failLogin = function () {
  this.failedLogins += 1;

  if (this.failedLogins >= 5) {
    this.lockUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
  }
};

userSchema.methods.resetFailures = function () {
  this.failedLogins = 0;
  this.lockUntil = null;
};

/* =========================
   MODEL EXPORT
========================= */

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;