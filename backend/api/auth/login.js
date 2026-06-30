import express from "express";
import jwt from "jsonwebtoken";

import User from "../../models/user.js";
import Save from "../../models/save.js";
import LogoutLog from "../../models/logoutLog.js";
const { LoginHistory } = require("../../utils/history");

import { comparePassword } from "./hash.js";

const router = express.Router();

/* =========================================
   TOKEN GENERATOR
========================================= */

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      verified: user.verified || false,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    }
  );
};

/* =========================================
   SAFE USER RESPONSE
========================================= */

const safeUser = (user) => ({
  id: user._id,
  email: user.email,
  username: user.username,
  role: user.role,
  verified: user.verified,
  active: user.active,
  avatar: user.avatar || "",
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

/* =========================================
   LOGIN ROUTE
========================================= */

router.post("/login", async (req, res) => {
  try {
    console.log("[LOGIN REQUEST]", {
      body: req.body,
      ip: req.ip,
      id: req.id,
    });

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    // prevent email enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const now = new Date();

    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: now } }
    );

    const save = await Save.findOneAndUpdate(
      { userId: user._id },
      {
        $setOnInsert: {
          userId: user._id,
          email: user.email,
          username: user.username || user.email.split("@")[0],
          role: user.role,
          level: 1,
          xp: 0,
          credits: 100,
          inventory: [],
          achievements: [],
          statistics: {
            logins: 0,
            chatsSent: 0,
            aiRequests: 0,
          },
          settings: {
            theme: "dark",
            notifications: true,
            sounds: true,
          },
          lastLogin: now,
        },
        $inc: { "statistics.logins": 1 },
      },
      { new: true, upsert: true }
    );

    const token = generateToken(user);

    // optional cookie auth
    if (process.env.USE_AUTH_COOKIE === "true") {
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
      save,
      requestId: req.id || null,
    });

  } catch (error) {
    console.error("[LOGIN ERROR]", error);

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });
  }
});

/* =========================================
   VERIFY TOKEN
========================================= */

router.get("/verify", async (req, res) => {
  try {
    const auth =
      req.headers.authorization ||
      req.cookies?.token;

    if (!auth) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    const token = auth.startsWith("Bearer ")
      ? auth.split(" ")[1]
      : auth;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const save = await Save.findOne({
      userId: user._id,
    });

    return res.json({
      success: true,
      user: safeUser(user),
      save,
    });

  } catch (error) {
    console.error("[VERIFY ERROR]", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

export default router;