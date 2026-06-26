import mongoose from "mongoose";

const logoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    email: String,

    username: String,

    ip: String,

    userAgent: String,

    reason: {
      type: String,
      default: "manual",
    },

    logoutAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const LogoutLog =
  mongoose.models.LogoutLog ||
  mongoose.model(
    "LogoutLog",
    logoutLogSchema
  );

export default LogoutLog;