import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* =====================================
       ACCOUNT
    ===================================== */

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Invalid email format",
      ],
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

    avatar: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    /* =====================================
       PERMISSIONS
    ===================================== */

    role: {
      type: String,
      enum: [
        "user",
        "moderator",
        "admin",
        "owner",
      ],
      default: "user",
    },

    permissions: {
      type: [String],
      default: [],
    },

    /* =====================================
       ACCOUNT STATUS
    ===================================== */

    active: {
      type: Boolean,
      default: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    banned: {
      type: Boolean,
      default: false,
    },

    banReason: {
      type: String,
      default: "",
    },

    banExpires: {
      type: Date,
      default: null,
    },

    /* =====================================
       SECURITY
    ===================================== */

    loginCount: {
      type: Number,
      default: 0,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    lastIp: {
      type: String,
      default: "",
    },

    failedLogins: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
      default: null,
      select: false,
    },

    /* =====================================
       DISCORD
    ===================================== */

    discordId: {
      type: String,
      default: null,
      index: true,
    },

    discordUsername: {
      type: String,
      default: "",
    },

    /* =====================================
       AI SYSTEM
    ===================================== */

    aiUsage: {
      requests: {
        type: Number,
        default: 0,
      },

      tokens: {
        type: Number,
        default: 0,
      },

      modelsUsed: {
        type: [String],
        default: [],
      },

      lastRequest: {
        type: Date,
        default: null,
      },
    },

    /* =====================================
       SUBSCRIPTION
    ===================================== */

    stripeCustomerId: {
      type: String,
      default: null,
    },

    subscription: {
      plan: {
        type: String,
        enum: [
          "free",
          "starter",
          "pro",
          "enterprise",
        ],
        default: "free",
      },

      status: {
        type: String,
        enum: [
          "active",
          "inactive",
          "cancelled",
          "expired",
        ],
        default: "inactive",
      },

      expiresAt: {
        type: Date,
        default: null,
      },
    },

    /* =====================================
       SAVE PROFILE LINK
    ===================================== */

    saveProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Save",
      default: null,
    },

    /* =====================================
       SETTINGS
    ===================================== */

    settings: {
      theme: {
        type: String,
        enum: [
          "dark",
          "light",
          "system",
        ],
        default: "dark",
      },

      notifications: {
        type: Boolean,
        default: true,
      },

      sounds: {
        type: Boolean,
        default: true,
      },

      language: {
        type: String,
        default: "en",
      },
    },

    /* =====================================
       API ACCESS
    ===================================== */

    apiKeys: [
      {
        name: String,
        key: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =====================================
   INDEXES
===================================== */

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ discordId: 1 });
userSchema.index({ stripeCustomerId: 1 });

/* =====================================
   VIRTUALS
===================================== */

userSchema.virtual("isPremium").get(function () {
  return (
    this.subscription &&
    this.subscription.plan !== "free"
  );
});

/* =====================================
   MODEL
===================================== */

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;