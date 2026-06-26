import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../../models/user.js";
import Save from "../../models/save.js";

import {
  hashPassword,
  validatePassword,
} from "./hash.js";

const router = express.Router();

/* =========================================
   TOKEN GENERATOR
========================================= */

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      verified: user.verified,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES || "7d",
    }
  );
};

/* =========================================
   SIGNUP ROUTE
========================================= */

router.post("/signup", async (req, res) => {
  let session = null;

  try {
    /* =====================================
       DEBUG LOG (RAILWAY IMPORTANT)
    ===================================== */
    console.log("🔥 SIGNUP HIT:", {
      body: req.body,
      ip: req.ip,
      path: req.originalUrl,
      requestId: req.id || null,
    });

    /* =====================================
       FORCE JSON RESPONSE SAFETY
    ===================================== */
    res.setHeader("Content-Type", "application/json");

    const { email, password, username } = req.body || {};

    /* =====================================
       CONFIG CHECK
    ===================================== */
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT missing in env");

      return res.status(500).json({
        success: false,
        message: "Server misconfigured",
      });
    }

    /* =====================================
       BASIC VALIDATION
    ===================================== */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername =
      username?.trim() ||
      normalizedEmail.split("@")[0];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 25
    ) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3–25 characters",
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message: "Invalid username format",
      });
    }

    const passwordCheck = validatePassword(password);

    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: "Weak password",
        errors: passwordCheck.errors,
      });
    }

    /* =====================================
       START DB SESSION
    ===================================== */
    session = await mongoose.startSession();
    session.startTransaction();

    /* =====================================
       DUPLICATE CHECK
    ===================================== */
    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    }).session(session);

    if (existingUser) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message: "Account already exists",
      });
    }

    /* =====================================
       CREATE USER
    ===================================== */
    const hashedPassword = await hashPassword(password);

    const [createdUser] = await User.create(
      [
        {
          email: normalizedEmail,
          username: normalizedUsername,
          password: hashedPassword,
          role: "user",
          active: true,
          verified: false,
          lastLogin: null,
        },
      ],
      { session }
    );

    /* =====================================
       CREATE SAVE PROFILE
    ===================================== */
    await Save.create(
      [
        {
          userId: createdUser._id,
          email: createdUser.email,
          username: createdUser.username,
          role: createdUser.role,

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
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    session = null;

    /* =====================================
       TOKEN
    ===================================== */
    const token = generateToken(createdUser);

    /* =====================================
       RESPONSE
    ===================================== */
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: createdUser._id,
        email: createdUser.email,
        username: createdUser.username,
        role: createdUser.role,
        verified: createdUser.verified,
        active: createdUser.active,
        createdAt: createdUser.createdAt,
      },
      requestId: req.id || null,
    });

  } catch (error) {
    console.error("❌ SIGNUP ERROR:", error);

    try {
      if (session) {
        await session.abortTransaction();
      }
    } catch (e) {
      console.error("Abort error:", e.message);
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Account already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    });

  } finally {
    try {
      if (session) await session.endSession();
    } catch {}
  }
});

export default router;