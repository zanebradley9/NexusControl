import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";

/* =========================
   RATE LIMIT (ANTI DDOS)
========================= */
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP
  message: "Too many requests, slow down.",
});

/* =========================
   HELMET (SECURITY HEADERS)
========================= */
export const securityHeaders = helmet();

/* =========================
   CORS LOCKDOWN
========================= */
export const corsOptions = cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
});

/* =========================
   XSS PROTECTION
========================= */
export const xssProtection = xss();

/* =========================
   NO SQL INJECTION PROTECTION
========================= */
export const sanitize = mongoSanitize();

const blockedIPs = new Set();

export function ipBlocker(req, res, next) {
  if (blockedIPs.has(req.ip)) {
    return res.status(403).send("Blocked");
  }
  next();
}