import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    itemId: String,
    name: String,

    quantity: {
      type: Number,
      default: 1,
    },

    rarity: {
      type: String,
      enum: [
        "common",
        "uncommon",
        "rare",
        "epic",
        "legendary",
      ],
      default: "common",
    },

    acquiredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const achievementSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    description: String,

    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const saveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      default: "user",
    },

    /* ==========================
       PROGRESSION
    ========================== */

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    xpRequired: {
      type: Number,
      default: 100,
    },

    rank: {
      type: String,
      default: "Rookie",
    },

    /* ==========================
       ECONOMY
    ========================== */

    credits: {
      type: Number,
      default: 0,
      min: 0,
    },

    bankBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEarned: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    /* ==========================
       ACTIVITY
    ========================== */

    loginCount: {
      type: Number,
      default: 0,
    },

    logoutCount: {
      type: Number,
      default: 0,
    },

    dailyStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    lastLogout: {
      type: Date,
      default: null,
    },

    /* ==========================
       AI STATS
    ========================== */

    aiUsage: {
      requests: {
        type: Number,
        default: 0,
      },

      tokensUsed: {
        type: Number,
        default: 0,
      },

      conversations: {
        type: Number,
        default: 0,
      },
    },

    /* ==========================
       INVENTORY
    ========================== */

    inventory: [inventoryItemSchema],

    achievements: [achievementSchema],

    /* ==========================
       STATISTICS
    ========================== */

    statistics: {
      messagesSent: {
        type: Number,
        default: 0,
      },

      commandsUsed: {
        type: Number,
        default: 0,
      },

      aiRequests: {
        type: Number,
        default: 0,
      },

      totalPlayTime: {
        type: Number,
        default: 0,
      },

      sessions: {
        type: Number,
        default: 0,
      },
    },

    /* ==========================
       PREMIUM
    ========================== */

    premium: {
      active: {
        type: Boolean,
        default: false,
      },

      plan: {
        type: String,
        default: "free",
      },

      expiresAt: {
        type: Date,
        default: null,
      },
    },

    /* ==========================
       DISCORD
    ========================== */

    discord: {
      linked: {
        type: Boolean,
        default: false,
      },

      discordId: {
        type: String,
        default: null,
      },

      username: {
        type: String,
        default: null,
      },
    },

    /* ==========================
       SECURITY
    ========================== */

    security: {
      failedLogins: {
        type: Number,
        default: 0,
      },

      lastFailedLogin: {
        type: Date,
        default: null,
      },

      accountFlags: {
        type: [String],
        default: [],
      },
    },

    /* ==========================
       SETTINGS
    ========================== */

    settings: {
      theme: {
        type: String,
        enum: ["dark", "light"],
        default: "dark",
      },

      language: {
        type: String,
        default: "en",
      },

      notifications: {
        type: Boolean,
        default: true,
      },

      soundEffects: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

saveSchema.index({ userId: 1 });
saveSchema.index({ email: 1 });
saveSchema.index({ username: 1 });
saveSchema.index({ level: -1 });
saveSchema.index({ credits: -1 });

const Save =
  mongoose.models.Save ||
  mongoose.model("Save", saveSchema);

export default Save;